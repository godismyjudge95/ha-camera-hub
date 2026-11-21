// Reads the codec string MSE needs (for example `avc1.4D0032,mp4a.40.2`)
// from an fMP4 init segment, because Frigate's media playlists do not say it.

function findBox(bytes: Uint8Array, type: string, from = 0): number {
  const [a, b, c, d] = [...type].map((char) => char.charCodeAt(0));
  for (let i = from; i + 3 < bytes.length; i++) {
    if (bytes[i] === a && bytes[i + 1] === b && bytes[i + 2] === c && bytes[i + 3] === d) return i;
  }
  return -1;
}

const hex = (value: number) => value.toString(16).toUpperCase().padStart(2, "0");

function videoCodec(bytes: Uint8Array): string | undefined {
  // avcC: configurationVersion, AVCProfileIndication, profile_compatibility,
  // AVCLevelIndication.
  const avc = findBox(bytes, "avcC");
  if (avc >= 0) return `avc1.${hex(bytes[avc + 5])}${hex(bytes[avc + 6])}${hex(bytes[avc + 7])}`;
  // hvcC: general_profile_idc sits in the low 5 bits of byte 1 and
  // general_level_idc in byte 12. Main profile tier and constraints are
  // common enough for browsers to accept them as written.
  const hevc = findBox(bytes, "hvcC");
  if (hevc >= 0) {
    const profile = bytes[hevc + 5] & 0x1f;
    const level = bytes[hevc + 16];
    return `hvc1.${profile}.6.L${level}.B0`;
  }
  return undefined;
}

function audioCodec(bytes: Uint8Array): string | undefined {
  if (findBox(bytes, "Opus") >= 0) return "opus";
  if (findBox(bytes, "fLaC") >= 0) return "flac";
  const mp4a = findBox(bytes, "mp4a");
  if (mp4a < 0) return undefined;
  const esds = findBox(bytes, "esds", mp4a);
  const objectType = esds >= 0 ? aacObjectType(bytes, esds + 8) : undefined;
  return `mp4a.40.${objectType ?? 2}`;
}

// Reads the AAC audio object type from the MPEG-4 descriptors in an esds box
// (ISO 14496-1): ES_Descriptor (tag 3) > DecoderConfigDescriptor (tag 4) >
// DecoderSpecificInfo (tag 5), whose first 5 bits are the object type.
function aacObjectType(bytes: Uint8Array, offset: number): number | undefined {
  const readDescriptor = (at: number) => {
    const tag = bytes[at];
    let length = 0;
    let i = at + 1;
    for (let n = 0; n < 4; n++, i++) {
      length = (length << 7) | (bytes[i] & 0x7f);
      if (!(bytes[i] & 0x80)) {
        i++;
        break;
      }
    }
    return { tag, body: i, end: i + length };
  };

  const es = readDescriptor(offset);
  if (es.tag !== 0x03) return undefined;
  const esFlags = bytes[es.body + 2];
  let next = es.body + 3;
  if (esFlags & 0x80) next += 2; // dependsOn_ES_ID
  if (esFlags & 0x40) next += 1 + bytes[next]; // URL
  if (esFlags & 0x20) next += 2; // OCR_ES_ID

  const config = readDescriptor(next);
  if (config.tag !== 0x04) return undefined;
  // objectTypeIndication, streamType, bufferSizeDB (3), maxBitrate (4), avgBitrate (4)
  const specific = readDescriptor(config.body + 13);
  if (specific.tag !== 0x05) return undefined;
  const objectType = bytes[specific.body] >> 3;
  return objectType > 0 ? objectType : undefined;
}

export function codecsFromInitSegment(bytes: Uint8Array): string {
  const codecs = [videoCodec(bytes), audioCodec(bytes)].filter(Boolean);
  if (codecs.length === 0) throw new Error("The recording has no known codec");
  return codecs.join(",");
}
