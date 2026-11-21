var pe=globalThis,Ce=pe.ShadowRoot&&(pe.ShadyCSS===void 0||pe.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Me=Symbol(),et=new WeakMap;class Re{constructor(e,t,i){if(this._$cssResult$=!0,i!==Me)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this._strings=t}get styleSheet(){let e=this._styleSheet,t=this._strings;if(Ce&&e===void 0){let i=t!==void 0&&t.length===1;if(i)e=et.get(t);if(e===void 0){if((this._styleSheet=e=new CSSStyleSheet).replaceSync(this.cssText),i)et.set(t,e)}}return e}toString(){return this.cssText}}var di=(e)=>{if(e._$cssResult$===!0)return e.cssText;else if(typeof e==="number")return e;else throw Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)},pi=(e)=>new Re(typeof e==="string"?e:String(e),void 0,Me),b=(e,...t)=>{let i=e.length===1?e[0]:t.reduce((s,r,n)=>s+di(r)+e[n+1],e[0]);return new Re(i,e,Me)},tt=(e,t)=>{if(Ce)e.adoptedStyleSheets=t.map((i)=>i instanceof CSSStyleSheet?i:i.styleSheet);else for(let i of t){let s=document.createElement("style"),r=pe.litNonce;if(r!==void 0)s.setAttribute("nonce",r);s.textContent=i.cssText,e.appendChild(s)}},hi=(e)=>{let t="";for(let i of e.cssRules)t+=i.cssText;return pi(t)},Ae=Ce?(e)=>e:(e)=>e instanceof CSSStyleSheet?hi(e):e;var{is:ui,defineProperty:mi,getOwnPropertyDescriptor:it,getOwnPropertyNames:fi,getOwnPropertySymbols:gi,getPrototypeOf:st}=Object,vi=!1,_=globalThis;if(vi)_.customElements??=customElements;var k=!0,C,rt=_.trustedTypes,bi=rt?rt.emptyScript:"",at=k?_.reactiveElementPolyfillSupportDevMode:_.reactiveElementPolyfillSupport;if(k)_.litIssuedWarnings??=new Set,C=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!_.litIssuedWarnings.has(t)&&!_.litIssuedWarnings.has(e))console.warn(t),_.litIssuedWarnings.add(t)},queueMicrotask(()=>{if(C("dev-mode","Lit is in dev mode. Not recommended for production!"),_.ShadyDOM?.inUse&&at===void 0)C("polyfill-support-missing","Shadow DOM is being polyfilled via `ShadyDOM` but the `polyfill-support` module has not been loaded.")});var yi=k?(e)=>{if(!_.emitLitDebugLogEvents)return;_.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))}:void 0,B=(e,t)=>e,Oe={toAttribute(e,t){switch(t){case Boolean:e=e?bi:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e);break}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=e!==null;break;case Number:i=e===null?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(s){i=null}break}return i}},ot=(e,t)=>!ui(e,t),nt={attribute:!0,type:String,converter:Oe,reflect:!1,useDefault:!1,hasChanged:ot};Symbol.metadata??=Symbol("metadata");_.litPropertyMetadata??=new WeakMap;class S extends HTMLElement{static addInitializer(e){this.__prepare(),(this._initializers??=[]).push(e)}static get observedAttributes(){return this.finalize(),this.__attributeToPropertyMap&&[...this.__attributeToPropertyMap.keys()]}static createProperty(e,t=nt){if(t.state)t.attribute=!1;if(this.__prepare(),this.prototype.hasOwnProperty(e))t=Object.create(t),t.wrapped=!0;if(this.elementProperties.set(e,t),!t.noAccessor){let i=k?Symbol.for(`${String(e)} (@property() cache)`):Symbol(),s=this.getPropertyDescriptor(e,i,t);if(s!==void 0)mi(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){let{get:s,set:r}=it(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};if(k&&s==null){if("value"in(it(this.prototype,e)??{}))throw Error(`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it's actually declared as a value on the prototype. Usually this is due to using @property or @state on a method.`);C("reactive-property-without-getter",`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it does not have a getter. This will be an error in a future version of Lit.`)}return{get:s,set(n){let a=s?.call(this);r?.call(this,n),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??nt}static __prepare(){if(this.hasOwnProperty(B("elementProperties",this)))return;let e=st(this);if(e.finalize(),e._initializers!==void 0)this._initializers=[...e._initializers];this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(B("finalized",this)))return;if(this.finalized=!0,this.__prepare(),this.hasOwnProperty(B("properties",this))){let t=this.properties,i=[...fi(t),...gi(t)];for(let s of i)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,s]of t)this.elementProperties.set(i,s)}this.__attributeToPropertyMap=new Map;for(let[t,i]of this.elementProperties){let s=this.__attributeNameForProperty(t,i);if(s!==void 0)this.__attributeToPropertyMap.set(s,t)}if(this.elementStyles=this.finalizeStyles(this.styles),k){if(this.hasOwnProperty("createProperty"))C("no-override-create-property","Overriding ReactiveElement.createProperty() is deprecated. The override will not be called with standard decorators");if(this.hasOwnProperty("getPropertyDescriptor"))C("no-override-get-property-descriptor","Overriding ReactiveElement.getPropertyDescriptor() is deprecated. The override will not be called with standard decorators")}}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let s of i)t.unshift(Ae(s))}else if(e!==void 0)t.push(Ae(e));return t}static __attributeNameForProperty(e,t){let i=t.attribute;return i===!1?void 0:typeof i==="string"?i:typeof e==="string"?e.toLowerCase():void 0}constructor(){super();this.__instanceProperties=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.__reflectingProperty=null,this.__initialize()}__initialize(){this.__updatePromise=new Promise((e)=>this.enableUpdating=e),this._$changedProperties=new Map,this.__saveInstanceProperties(),this.requestUpdate(),this.constructor._initializers?.forEach((e)=>e(this))}addController(e){if((this.__controllers??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected)e.hostConnected?.()}removeController(e){this.__controllers?.delete(e)}__saveInstanceProperties(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())if(this.hasOwnProperty(i))e.set(i,this[i]),delete this[i];if(e.size>0)this.__instanceProperties=e}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return tt(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this.__controllers?.forEach((e)=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this.__controllers?.forEach((e)=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$attributeToProperty(e,i)}__propertyToAttribute(e,t){let s=this.constructor.elementProperties.get(e),r=this.constructor.__attributeNameForProperty(e,s);if(r!==void 0&&s.reflect===!0){let a=(s.converter?.toAttribute!==void 0?s.converter:Oe).toAttribute(t,s.type);if(k&&this.constructor.enabledWarnings.includes("migration")&&a===void 0)C("undefined-attribute-value",`The attribute value for the ${e} property is undefined on element ${this.localName}. The attribute will be removed, but in the previous version of \`ReactiveElement\`, the attribute would not have changed.`);if(this.__reflectingProperty=e,a==null)this.removeAttribute(r);else this.setAttribute(r,a);this.__reflectingProperty=null}}_$attributeToProperty(e,t){let i=this.constructor,s=i.__attributeToPropertyMap.get(e);if(s!==void 0&&this.__reflectingProperty!==s){let r=i.getPropertyOptions(s),n=typeof r.converter==="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Oe;this.__reflectingProperty=s;let a=n.fromAttribute(t,r.type);this[s]=a??this.__defaultValues?.get(s)??a,this.__reflectingProperty=null}}requestUpdate(e,t,i,s=!1,r){if(e!==void 0){if(k&&e instanceof Event)C("","The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()");let n=this.constructor;if(s===!1)r=this[e];if(i??=n.getPropertyOptions(e),(i.hasChanged??ot)(r,t)||i.useDefault&&i.reflect&&r===this.__defaultValues?.get(e)&&!this.hasAttribute(n.__attributeNameForProperty(e,i)))this._$changeProperty(e,t,i);else return}if(this.isUpdatePending===!1)this.__updatePromise=this.__enqueueUpdate()}_$changeProperty(e,t,{useDefault:i,reflect:s,wrapped:r},n){if(i&&!(this.__defaultValues??=new Map).has(e)){if(this.__defaultValues.set(e,n??t??this[e]),r!==!0||n!==void 0)return}if(!this._$changedProperties.has(e)){if(!this.hasUpdated&&!i)t=void 0;this._$changedProperties.set(e,t)}if(s===!0&&this.__reflectingProperty!==e)(this.__reflectingProperties??=new Set).add(e)}async __enqueueUpdate(){this.isUpdatePending=!0;try{await this.__updatePromise}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();if(e!=null)await e;return!this.isUpdatePending}scheduleUpdate(){let e=this.performUpdate();if(k&&this.constructor.enabledWarnings.includes("async-perform-update")&&typeof e?.then==="function")C("async-perform-update",`Element ${this.localName} returned a Promise from performUpdate(). This behavior is deprecated and will be removed in a future version of ReactiveElement.`);return e}performUpdate(){if(!this.isUpdatePending)return;if(yi?.({kind:"update"}),!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),k){let r=[...this.constructor.elementProperties.keys()].filter((n)=>this.hasOwnProperty(n)&&(n in st(this)));if(r.length)throw Error(`The following properties on element ${this.localName} will not trigger updates as expected because they are set using class fields: ${r.join(", ")}. Native class fields and some compiled output will overwrite accessors used for detecting changes. See https://lit.dev/msg/class-field-shadowing for more information.`)}if(this.__instanceProperties){for(let[s,r]of this.__instanceProperties)this[s]=r;this.__instanceProperties=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,r]of i){let{wrapped:n}=r,a=this[s];if(n===!0&&!this._$changedProperties.has(s)&&a!==void 0)this._$changeProperty(s,void 0,r,a)}}let e=!1,t=this._$changedProperties;try{if(e=this.shouldUpdate(t),e)this.willUpdate(t),this.__controllers?.forEach((i)=>i.hostUpdate?.()),this.update(t);else this.__markUpdated()}catch(i){throw e=!1,this.__markUpdated(),i}if(e)this._$didUpdate(t)}willUpdate(e){}_$didUpdate(e){if(this.__controllers?.forEach((t)=>t.hostUpdated?.()),!this.hasUpdated)this.hasUpdated=!0,this.firstUpdated(e);if(this.updated(e),k&&this.isUpdatePending&&this.constructor.enabledWarnings.includes("change-in-update"))C("change-in-update",`Element ${this.localName} scheduled an update (generally because a property was set) after an update completed, causing a new update to be scheduled. This is inefficient and should be avoided unless the next update can only be scheduled as a side effect of the previous update.`)}__markUpdated(){this._$changedProperties=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.__updatePromise}shouldUpdate(e){return!0}update(e){this.__reflectingProperties&&=this.__reflectingProperties.forEach((t)=>this.__propertyToAttribute(t,this[t])),this.__markUpdated()}updated(e){}firstUpdated(e){}}S.elementStyles=[];S.shadowRootOptions={mode:"open"};S[B("elementProperties",S)]=new Map;S[B("finalized",S)]=new Map;at?.({ReactiveElement:S});if(k){S.enabledWarnings=["change-in-update","async-perform-update"];let e=function(t){if(!t.hasOwnProperty(B("enabledWarnings",t)))t.enabledWarnings=t.enabledWarnings.slice()};S.enableWarning=function(t){if(e(this),!this.enabledWarnings.includes(t))this.enabledWarnings.push(t)},S.disableWarning=function(t){e(this);let i=this.enabledWarnings.indexOf(t);if(i>=0)this.enabledWarnings.splice(i,1)}}(_.reactiveElementVersions??=[]).push("2.1.2");if(k&&_.reactiveElementVersions.length>1)queueMicrotask(()=>{C("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var E=globalThis,f=(e)=>{if(!E.emitLitDebugLogEvents)return;E.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))},wi=0,ee;E.litIssuedWarnings??=new Set,ee=(e,t)=>{if(t+=e?` See https://lit.dev/msg/${e} for more information.`:"",!E.litIssuedWarnings.has(t)&&!E.litIssuedWarnings.has(e))console.warn(t),E.litIssuedWarnings.add(t)},queueMicrotask(()=>{ee("dev-mode","Lit is in dev mode. Not recommended for production!")});var M=E.ShadyDOM?.inUse&&E.ShadyDOM?.noPatch===!0?E.ShadyDOM.wrap:(e)=>e,he=E.trustedTypes,lt=he?he.createPolicy("lit-html",{createHTML:(e)=>e}):void 0,xi=(e)=>e,ge=(e,t,i)=>xi,_i=(e)=>{if(U!==ge)throw Error("Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.");U=e},ki=()=>{U=ge},Ue=(e,t,i)=>U(e,t,i),ft="$lit$",R=`lit$${Math.random().toFixed(9).slice(2)}$`,gt="?"+R,Si=`<${gt}>`,z=document,te=()=>z.createComment(""),ie=(e)=>e===null||typeof e!="object"&&typeof e!="function",He=Array.isArray,$i=(e)=>He(e)||typeof e?.[Symbol.iterator]==="function",De=`[ 	
\f\r]`,Ei=`[^ 	
\f\r"'\`<>=]`,Ti=`[^\\s"'>=/]`,G=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ct=1,Le=2,Pi=3,dt=/-->/g,pt=/>/g,O=new RegExp(`>|${De}(?:(${Ti}+)(${De}*=${De}*(?:${Ei}|("|')|))|$)`,"g"),Ci=0,ht=1,Mi=2,ut=3,ze=/'/g,Ne=/"/g,vt=/^(?:script|style|textarea|title)$/i,Ri=1,ue=2,me=3,Ie=1,fe=2,Ai=3,Oi=4,Di=5,Ve=6,Li=7,Fe=(e)=>(t,...i)=>{if(t.some((s)=>s===void 0))console.warn(`Some template strings are undefined.
This is probably caused by illegal octal escape sequences.`);if(i.some((s)=>s?._$litStatic$))ee("",`Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.
Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`);return{["_$litType$"]:e,strings:t,values:i}},o=Fe(Ri),_s=Fe(ue),ks=Fe(me),N=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),mt=new WeakMap,L=z.createTreeWalker(z,129),U=ge;function bt(e,t){if(!He(e)||!e.hasOwnProperty("raw")){let i="invalid template strings array";throw i=`
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        `.trim().replace(/\n */g,`
`),Error(i)}return lt!==void 0?lt.createHTML(t):t}var zi=(e,t)=>{let i=e.length-1,s=[],r=t===ue?"<svg>":t===me?"<math>":"",n,a=G;for(let p=0;p<i;p++){let m=e[p],h=-1,u,g=0,c;while(g<m.length){if(a.lastIndex=g,c=a.exec(m),c===null)break;if(g=a.lastIndex,a===G){if(c[ct]==="!--")a=dt;else if(c[ct]!==void 0)a=pt;else if(c[Le]!==void 0){if(vt.test(c[Le]))n=new RegExp(`</${c[Le]}`,"g");a=O}else if(c[Pi]!==void 0)throw Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions")}else if(a===O)if(c[Ci]===">")a=n??G,h=-1;else if(c[ht]===void 0)h=-2;else h=a.lastIndex-c[Mi].length,u=c[ht],a=c[ut]===void 0?O:c[ut]==='"'?Ne:ze;else if(a===Ne||a===ze)a=O;else if(a===dt||a===pt)a=G;else a=O,n=void 0}console.assert(h===-1||a===O||a===ze||a===Ne,"unexpected parse state B");let y=a===O&&e[p+1].startsWith("/>")?" ":"";r+=a===G?m+Si:h>=0?(s.push(u),m.slice(0,h)+ft+m.slice(h))+R+y:m+R+(h===-2?p:y)}let l=r+(e[i]||"<?>")+(t===ue?"</svg>":t===me?"</math>":"");return[bt(e,l),s]};class se{constructor({strings:e,["_$litType$"]:t},i){this.parts=[];let s,r=0,n=0,a=e.length-1,l=this.parts,[p,m]=zi(e,t);if(this.el=se.createElement(p,i),L.currentNode=this.el.content,t===ue||t===me){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}while((s=L.nextNode())!==null&&l.length<a){if(s.nodeType===1){{let h=s.localName;if(/^(?:textarea|template)$/i.test(h)&&s.innerHTML.includes(R)){let u=`Expressions are not supported inside \`${h}\` elements. See https://lit.dev/msg/expression-in-${h} for more information.`;if(h==="template")throw Error(u);else ee("",u)}}if(s.hasAttributes()){for(let h of s.getAttributeNames())if(h.endsWith(ft)){let u=m[n++],c=s.getAttribute(h).split(R),y=/([.?@])?(.*)/.exec(u);l.push({type:Ie,index:r,name:y[2],strings:c,ctor:y[1]==="."?wt:y[1]==="?"?xt:y[1]==="@"?_t:ne}),s.removeAttribute(h)}else if(h.startsWith(R))l.push({type:Ve,index:r}),s.removeAttribute(h)}if(vt.test(s.tagName)){let h=s.textContent.split(R),u=h.length-1;if(u>0){s.textContent=he?he.emptyScript:"";for(let g=0;g<u;g++)s.append(h[g],te()),L.nextNode(),l.push({type:fe,index:++r});s.append(h[u],te())}}}else if(s.nodeType===8)if(s.data===gt)l.push({type:fe,index:r});else{let u=-1;while((u=s.data.indexOf(R,u+1))!==-1)l.push({type:Li,index:r}),u+=R.length-1}r++}if(m.length!==n)throw Error('Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=${true} ?disabled=${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: \n`'+e.join("${...}")+"`");f&&f({kind:"template prep",template:this,clonableTemplate:this.el,parts:this.parts,strings:e})}static createElement(e,t){let i=z.createElement("template");return i.innerHTML=e,i}}function W(e,t,i=e,s){if(t===N)return t;let r=s!==void 0?i.__directives?.[s]:i.__directive,n=ie(t)?void 0:t._$litDirective$;if(r?.constructor!==n){if(r?._$notifyDirectiveConnectionChanged?.(!1),n===void 0)r=void 0;else r=new n(e),r._$initialize(e,i,s);if(s!==void 0)(i.__directives??=[])[s]=r;else i.__directive=r}if(r!==void 0)t=W(e,r._$resolve(e,t.values),r,s);return t}class yt{constructor(e,t){this._$parts=[],this._$disconnectableChildren=void 0,this._$template=e,this._$parent=t}get parentNode(){return this._$parent.parentNode}get _$isConnected(){return this._$parent._$isConnected}_clone(e){let{el:{content:t},parts:i}=this._$template,s=(e?.creationScope??z).importNode(t,!0);L.currentNode=s;let r=L.nextNode(),n=0,a=0,l=i[0];while(l!==void 0){if(n===l.index){let p;if(l.type===fe)p=new re(r,r.nextSibling,this,e);else if(l.type===Ie)p=new l.ctor(r,l.name,l.strings,this,e);else if(l.type===Ve)p=new kt(r,this,e);this._$parts.push(p),l=i[++a]}if(n!==l?.index)r=L.nextNode(),n++}return L.currentNode=z,s}_update(e){let t=0;for(let i of this._$parts){if(i!==void 0)if(f&&f({kind:"set part",part:i,value:e[t],valueIndex:t,values:e,templateInstance:this}),i.strings!==void 0)i._$setValue(e,i,t),t+=i.strings.length-2;else i._$setValue(e[t]);t++}}}class re{get _$isConnected(){return this._$parent?._$isConnected??this.__isConnected}constructor(e,t,i,s){this.type=fe,this._$committedValue=d,this._$disconnectableChildren=void 0,this._$startNode=e,this._$endNode=t,this._$parent=i,this.options=s,this.__isConnected=s?.isConnected??!0,this._textSanitizer=void 0}get parentNode(){let e=M(this._$startNode).parentNode,t=this._$parent;if(t!==void 0&&e?.nodeType===11)e=t.parentNode;return e}get startNode(){return this._$startNode}get endNode(){return this._$endNode}_$setValue(e,t=this){if(this.parentNode===null)throw Error("This `ChildPart` has no `parentNode` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's `innerHTML` or `textContent` can do this.");if(e=W(this,e,t),ie(e)){if(e===d||e==null||e===""){if(this._$committedValue!==d)f&&f({kind:"commit nothing to child",start:this._$startNode,end:this._$endNode,parent:this._$parent,options:this.options}),this._$clear();this._$committedValue=d}else if(e!==this._$committedValue&&e!==N)this._commitText(e)}else if(e._$litType$!==void 0)this._commitTemplateResult(e);else if(e.nodeType!==void 0){if(this.options?.host===e){this._commitText("[probable mistake: rendered a template's host in itself (commonly caused by writing ${this} in a template]"),console.warn("Attempted to render the template host",e,"inside itself. This is almost always a mistake, and in dev mode ","we render some warning text. In production however, we'll ","render it, which will usually result in an error, and sometimes ","in the element disappearing from the DOM.");return}this._commitNode(e)}else if($i(e))this._commitIterable(e);else this._commitText(e)}_insert(e){return M(M(this._$startNode).parentNode).insertBefore(e,this._$endNode)}_commitNode(e){if(this._$committedValue!==e){if(this._$clear(),U!==ge){let t=this._$startNode.parentNode?.nodeName;if(t==="STYLE"||t==="SCRIPT"){let i="Forbidden";if(t==="STYLE")i="Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css`...` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.";else i="Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.";throw Error(i)}}f&&f({kind:"commit node",start:this._$startNode,parent:this._$parent,value:e,options:this.options}),this._$committedValue=this._insert(e)}}_commitText(e){if(this._$committedValue!==d&&ie(this._$committedValue)){let t=M(this._$startNode).nextSibling;if(this._textSanitizer===void 0)this._textSanitizer=Ue(t,"data","property");e=this._textSanitizer(e),f&&f({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}else{let t=z.createTextNode("");if(this._commitNode(t),this._textSanitizer===void 0)this._textSanitizer=Ue(t,"data","property");e=this._textSanitizer(e),f&&f({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}this._$committedValue=e}_commitTemplateResult(e){let{values:t,["_$litType$"]:i}=e,s=typeof i==="number"?this._$getTemplate(e):(i.el===void 0&&(i.el=se.createElement(bt(i.h,i.h[0]),this.options)),i);if(this._$committedValue?._$template===s)f&&f({kind:"template updating",template:s,instance:this._$committedValue,parts:this._$committedValue._$parts,options:this.options,values:t}),this._$committedValue._update(t);else{let r=new yt(s,this),n=r._clone(this.options);f&&f({kind:"template instantiated",template:s,instance:r,parts:r._$parts,options:this.options,fragment:n,values:t}),r._update(t),f&&f({kind:"template instantiated and updated",template:s,instance:r,parts:r._$parts,options:this.options,fragment:n,values:t}),this._commitNode(n),this._$committedValue=r}}_$getTemplate(e){let t=mt.get(e.strings);if(t===void 0)mt.set(e.strings,t=new se(e));return t}_commitIterable(e){if(!He(this._$committedValue))this._$committedValue=[],this._$clear();let t=this._$committedValue,i=0,s;for(let r of e){if(i===t.length)t.push(s=new re(this._insert(te()),this._insert(te()),this,this.options));else s=t[i];s._$setValue(r),i++}if(i<t.length)this._$clear(s&&M(s._$endNode).nextSibling,i),t.length=i}_$clear(e=M(this._$startNode).nextSibling,t){this._$notifyConnectionChanged?.(!1,!0,t);while(e!==this._$endNode){let i=M(e).nextSibling;M(e).remove(),e=i}}setConnected(e){if(this._$parent===void 0)this.__isConnected=e,this._$notifyConnectionChanged?.(e);else throw Error("part.setConnected() may only be called on a RootPart returned from render().")}}class ne{get tagName(){return this.element.tagName}get _$isConnected(){return this._$parent._$isConnected}constructor(e,t,i,s,r){if(this.type=Ie,this._$committedValue=d,this._$disconnectableChildren=void 0,this.element=e,this.name=t,this._$parent=s,this.options=r,i.length>2||i[0]!==""||i[1]!=="")this._$committedValue=Array(i.length-1).fill(new String),this.strings=i;else this._$committedValue=d;this._sanitizer=void 0}_$setValue(e,t=this,i,s){let r=this.strings,n=!1;if(r===void 0){if(e=W(this,e,t,0),n=!ie(e)||e!==this._$committedValue&&e!==N,n)this._$committedValue=e}else{let a=e;e=r[0];let l,p;for(l=0;l<r.length-1;l++){if(p=W(this,a[i+l],t,l),p===N)p=this._$committedValue[l];if(n||=!ie(p)||p!==this._$committedValue[l],p===d)e=d;else if(e!==d)e+=(p??"")+r[l+1];this._$committedValue[l]=p}}if(n&&!s)this._commitValue(e)}_commitValue(e){if(e===d)M(this.element).removeAttribute(this.name);else{if(this._sanitizer===void 0)this._sanitizer=U(this.element,this.name,"attribute");e=this._sanitizer(e??""),f&&f({kind:"commit attribute",element:this.element,name:this.name,value:e,options:this.options}),M(this.element).setAttribute(this.name,e??"")}}}class wt extends ne{constructor(){super(...arguments);this.type=Ai}_commitValue(e){if(this._sanitizer===void 0)this._sanitizer=U(this.element,this.name,"property");e=this._sanitizer(e),f&&f({kind:"commit property",element:this.element,name:this.name,value:e,options:this.options}),this.element[this.name]=e===d?void 0:e}}class xt extends ne{constructor(){super(...arguments);this.type=Oi}_commitValue(e){f&&f({kind:"commit boolean attribute",element:this.element,name:this.name,value:!!(e&&e!==d),options:this.options}),M(this.element).toggleAttribute(this.name,!!e&&e!==d)}}class _t extends ne{constructor(e,t,i,s,r){super(e,t,i,s,r);if(this.type=Di,this.strings!==void 0)throw Error(`A \`<${e.localName}>\` has a \`@${t}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`)}_$setValue(e,t=this){if(e=W(this,e,t,0)??d,e===N)return;let i=this._$committedValue,s=e===d&&i!==d||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==d&&(i===d||s);if(f&&f({kind:"commit event listener",element:this.element,name:this.name,value:e,options:this.options,removeListener:s,addListener:r,oldListener:i}),s)this.element.removeEventListener(this.name,this,i);if(r)this.element.addEventListener(this.name,this,e);this._$committedValue=e}handleEvent(e){if(typeof this._$committedValue==="function")this._$committedValue.call(this.options?.host??this.element,e);else this._$committedValue.handleEvent(e)}}class kt{constructor(e,t,i){this.element=e,this.type=Ve,this._$disconnectableChildren=void 0,this._$parent=t,this.options=i}get _$isConnected(){return this._$parent._$isConnected}_$setValue(e){f&&f({kind:"commit to element binding",element:this.element,value:e,options:this.options}),W(this,e)}}var Ni=E.litHtmlPolyfillSupportDevMode;Ni?.(se,re);(E.litHtmlVersions??=[]).push("3.3.3");if(E.litHtmlVersions.length>1)queueMicrotask(()=>{ee("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var Q=(e,t,i)=>{if(t==null)throw TypeError(`The container to render into may not be ${t}`);let s=wi++,r=i?.renderBefore??t,n=r._$litPart$;if(f&&f({kind:"begin render",id:s,value:e,container:t,options:i,part:n}),n===void 0){let a=i?.renderBefore??null;r._$litPart$=n=new re(t.insertBefore(te(),a),a,void 0,i??{})}return n._$setValue(e),f&&f({kind:"end render",id:s,value:e,container:t,options:i,part:n}),n};Q.setSanitizer=_i,Q.createSanitizer=Ue,Q._testOnlyClearSanitizerFactoryDoNotCallOrElse=ki;var Ui=(e,t)=>e,Be=!0,A=globalThis,St;if(Be)A.litIssuedWarnings??=new Set,St=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!A.litIssuedWarnings.has(t)&&!A.litIssuedWarnings.has(e))console.warn(t),A.litIssuedWarnings.add(t)};class v extends S{constructor(){super(...arguments);this.renderOptions={host:this},this.__childPart=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();if(!this.hasUpdated)this.renderOptions.isConnected=this.isConnected;super.update(e),this.__childPart=Q(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this.__childPart?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this.__childPart?.setConnected(!1)}render(){return N}}v._$litElement$=!0;v[Ui("finalized",v)]=!0;A.litElementHydrateSupport?.({LitElement:v});var Hi=Be?A.litElementPolyfillSupportDevMode:A.litElementPolyfillSupport;Hi?.({LitElement:v});(A.litElementVersions??=[]).push("4.2.2");if(Be&&A.litElementVersions.length>1)queueMicrotask(()=>{St("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});function $t(e){return e.callWS({type:"camera_hub/config"})}async function ve(e,t,i=30){let s=await e.callWS({type:"auth/sign_path",path:t,expires:i});return e.hassUrl(s.path)}async function be(e,t){return(await e.callWS({type:"camera/webrtc/get_client_config",entity_id:t})).configuration?.iceServers??[]}class We{constructor(e){this.onIdle=e;this.timeoutMs=0}setTimeout(e){this.timeoutMs=e*1000,this.restart()}restart(){if(clearTimeout(this.timer),this.timeoutMs>0)this.timer=setTimeout(this.onIdle,this.timeoutMs)}stop(){clearTimeout(this.timer)}}async function Et(e,t,i,s,r){let n=await e.callWS({type:"frigate/reviews/get",instance_id:t,cameras:i,severity:"alert",after:s,limit:r});return JSON.parse(n)}function Tt(e,t,i){return e.connection.subscribeMessage((s)=>i(JSON.parse(s)),{type:"frigate/reviews/subscribe",instance_id:t})}async function Pt(e,t,i){let s=await e.callWS({type:"frigate/recordings/summary",instance_id:t,camera:i,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone});return typeof s==="string"?JSON.parse(s):s}async function Ct(e,t,i,s,r){let n=await e.callWS({type:"frigate/reviews/get",instance_id:t,cameras:[i],after:s,before:r,limit:1000});return JSON.parse(n)}var Ii=new Set(["cat","dog","bird","horse","deer","bear","raccoon","fox","squirrel"]),Vi=new Set(["car","motorcycle","bicycle","bus","truck","boat"]);function Mt(e,t){let i=e.data.objects.map((s)=>s.split("-")[0]);switch(t){case"all":return!0;case"person":return i.includes("person");case"animal":return i.some((s)=>Ii.has(s));case"vehicle":return i.some((s)=>Vi.has(s))}}function H(e){let i=(e.data.sub_labels[0]??e.data.objects[0]??"Motion").replace(/[-_]/g," ");return i.charAt(0).toUpperCase()+i.slice(1)}function je(e,t,i){let s=e.filter((r)=>r.id!==t.id);return[t,...s].sort((r,n)=>n.start_time-r.start_time).slice(0,i)}function Rt(e,t){let i=Math.max(0,t/1000-e);if(i<60)return"now";if(i<3600)return`${Math.floor(i/60)}m`;if(i<86400)return`${Math.floor(i/3600)}h`;return`${Math.floor(i/86400)}d`}function ye(e,t){let i=t.thumb_path.replace(/^\/media\/frigate\//,"");return`/api/frigate/${encodeURIComponent(e)}/${i}`}function Ye(e,t,i,s){return`/api/frigate/${encodeURIComponent(e)}/vod/${encodeURIComponent(t)}/start/${Math.floor(i)}/end/${Math.ceil(s)}/index.m3u8`}function At(e,t){if(t.end_time===null)return;return Ye(e,t.camera,t.start_time-2,t.end_time+2)}function Ot(e){if(e.end_time===null)return;let t=Math.max(0,Math.round(e.end_time-e.start_time));return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}function Dt(e,t){let i=(a)=>new Date(a).toDateString(),s=i(t),r=i(t-86400000),n=[];for(let a of e){let l=a.start_time*1000,p=i(l),m=p===s?"Today":p===r?"Yesterday":new Date(l).toLocaleDateString([],{weekday:"short",month:"short",day:"numeric"}),h=n.at(-1);if(h?.label===m)h.reviews.push(a);else n.push({label:m,reviews:[a]})}return n}function x(e){if(typeof e==="object"&&e!==null&&"message"in e){let t=e.message;if(typeof t==="string"&&t)return t}return typeof e==="string"?e:"Something went wrong"}var Lt=24,qe=60;class Xe{constructor(){this.reviews=[];this.hours=Lt;this.listeners=new Set}start(e,t,i){if(this.unsubscribe)return;let s=new Set(i);this.unsubscribe=Tt(e,t,(n)=>{if(n.after.severity!=="alert"||!s.has(n.after.camera))return;this.reviews=je(this.reviews,n.after,qe),this.notify()});let r=Math.floor(Date.now()/1000)-Lt*3600;Et(e,t,i,r,qe).then((n)=>{let a=this.reviews;for(let l of n)a=je(a,l,qe);this.reviews=a,this.error=void 0,this.notify()},(n)=>{this.error=x(n),this.notify()})}stop(){this.unsubscribe?.then((e)=>e()).catch(()=>{return}),this.unsubscribe=void 0}onChange(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(){for(let e of this.listeners)e()}}var w=b`
  :host {
    --ch-bg: #0b0d10;
    --ch-surface: #15181d;
    --ch-surface-raised: #1e2228;
    --ch-text: #e8eaed;
    --ch-text-secondary: rgba(232, 234, 237, 0.6);
    --ch-hairline: rgba(255, 255, 255, 0.06);
    --ch-accent: #4c8dff;
    --ch-red: #ff453a;
    --ch-amber: #ffb020;
    --ch-radius-main: 16px;
    --ch-radius-tile: 12px;
    --ch-radius-thumb: 10px;
    --ch-gap: 12px;
    --ch-font: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-family: var(--ch-font);
    color: var(--ch-text);
    -webkit-tap-highlight-color: transparent;
  }
`,j=b`
  .spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 36px;
    height: 36px;
    margin: -18px 0 0 -18px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--ch-text);
    border-radius: 50%;
    animation: ch-spin 0.9s linear infinite;
  }
  @keyframes ch-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;var zt=3600,Fi=zt*1000*0.8;class Nt{constructor(e=Date.now){this.now=e;this.cache=new Map}get(e,t){let i=this.cache.get(t);if(i&&this.now()-i.signedAt<Fi)return i.url;let s=ve(e,t,zt);return this.cache.set(t,{url:s,signedAt:this.now()}),s.catch(()=>this.cache.delete(t)),s}}var I=new Nt;function Ut(e){let t=e.split(/\r?\n/).map((a)=>a.trim());if(t[0]!=="#EXTM3U")throw Error("Not an HLS playlist");let i,s,r=0,n=[];for(let a of t)if(a.startsWith("#EXT-X-MAP:"))i=/URI="([^"]+)"/.exec(a)?.[1];else if(a.startsWith("#EXTINF:"))s=Number.parseFloat(a.slice(8));else if(a&&!a.startsWith("#")&&s!==void 0)n.push({uri:a,start:r,duration:s}),r+=s,s=void 0;if(!i)throw Error("The playlist has no fMP4 init segment");return{initUri:i,segments:n,duration:r}}function Ke(e,t){if(e.length===0)return-1;let i=0,s=e.length-1;while(i<s){let r=Math.ceil((i+s)/2);if(e[r].start<=t)i=r;else s=r-1}return i}function Ht(e,t){let i=new URL(e),s=new URL(t,i),r=i.searchParams.get("authSig");if(r&&!s.searchParams.has("authSig"))s.searchParams.set("authSig",r);return s.toString()}function Y(e,t,i=0){let[s,r,n,a]=[...t].map((l)=>l.charCodeAt(0));for(let l=i;l+3<e.length;l++)if(e[l]===s&&e[l+1]===r&&e[l+2]===n&&e[l+3]===a)return l;return-1}var Ze=(e)=>e.toString(16).toUpperCase().padStart(2,"0");function Bi(e){let t=Y(e,"avcC");if(t>=0)return`avc1.${Ze(e[t+5])}${Ze(e[t+6])}${Ze(e[t+7])}`;let i=Y(e,"hvcC");if(i>=0){let s=e[i+5]&31,r=e[i+16];return`hvc1.${s}.6.L${r}.B0`}return}function Wi(e){if(Y(e,"Opus")>=0)return"opus";if(Y(e,"fLaC")>=0)return"flac";let t=Y(e,"mp4a");if(t<0)return;let i=Y(e,"esds",t);return`mp4a.40.${(i>=0?ji(e,i+8):void 0)??2}`}function ji(e,t){let i=(m)=>{let h=e[m],u=0,g=m+1;for(let c=0;c<4;c++,g++)if(u=u<<7|e[g]&127,!(e[g]&128)){g++;break}return{tag:h,body:g,end:g+u}},s=i(t);if(s.tag!==3)return;let r=e[s.body+2],n=s.body+3;if(r&128)n+=2;if(r&64)n+=1+e[n];if(r&32)n+=2;let a=i(n);if(a.tag!==4)return;let l=i(a.body+13);if(l.tag!==5)return;let p=e[l.body]>>3;return p>0?p:void 0}function It(e){let t=[Bi(e),Wi(e)].filter(Boolean);if(t.length===0)throw Error("The recording has no known codec");return t.join(",")}var Yi=["avc1.640029","avc1.64002A","avc1.640033","hvc1.1.6.L153.B0","mp4a.40.2","mp4a.40.5","flac","opus"];async function we(e){let t=window.ManagedMediaSource,i=t??window.MediaSource;if(!i)throw Error("This browser cannot play the stream");let s=new i,r;if(t)e.disableRemotePlayback=!0,e.removeAttribute("src"),e.srcObject=s;else e.srcObject=null,r=URL.createObjectURL(s),e.src=r;let n=()=>{if(t)e.srcObject=null;else e.removeAttribute("src");if(e.load(),r)URL.revokeObjectURL(r)};if(!await new Promise((l)=>{let p=setTimeout(()=>l(!1),5000);s.addEventListener("sourceopen",()=>{clearTimeout(p),l(!0)},{once:!0})}))throw n(),Error("This browser did not open the video player");return{mediaSource:s,isTypeSupported:(l)=>i.isTypeSupported(l),detach:n}}function Vt(e){return Yi.filter((t)=>e(`video/mp4; codecs="${t}"`)).join()}function Ft(e,t,i){let s={};if(i-e>3)s.seekTo=i-0.5;else if(e<t)s.seekTo=t;let r=s.seekTo??e;if(r-t>10)s.removeEnd=r-5;return s}var Bt=30,qi=60;class ae{constructor(e,t){this.video=e;this.onState=t;this.playlistUrl="";this.loaded=new Set;this.loading=!1;this.closed=!1;this.abort=new AbortController;this.fill=async()=>{let e=this.playlist;if(!e||this.loading||this.closed)return;this.loading=!0;try{let i=this.video.currentTime,s=Ke(e.segments,i);for(let r=s;r<e.segments.length;r++){let n=e.segments[r];if(n.start>i+Bt)break;if(this.loaded.has(r))continue;if(await this.append(await this.fetchBytes(n.uri)),this.loaded.add(r),Math.abs(this.video.currentTime-i)>n.duration)break}await this.trim()}catch(i){if(!this.closed)this.onState("error",x(i))}finally{this.loading=!1}let t=Ke(e.segments,this.video.currentTime);if(!this.closed&&t>=0&&!this.loaded.has(t))this.fill()}}get duration(){return this.playlist?.duration??0}async load(e,t=0){this.onState("loading");try{let i=await fetch(e,{signal:this.abort.signal});if(!i.ok)throw Error(`The recording is not available (${i.status})`);if(this.playlist=Ut(await i.text()),this.playlistUrl=e,this.playlist.segments.length===0)throw Error("There is no recording for this time");let s=new Uint8Array(await this.fetchBytes(this.playlist.initUri));this.attached=await we(this.video);let{mediaSource:r}=this.attached;r.duration=this.playlist.duration,this.buffer=r.addSourceBuffer(`video/mp4; codecs="${It(s)}"`),this.buffer.mode="segments",await this.append(s.buffer),this.video.addEventListener("timeupdate",this.fill),this.video.addEventListener("seeking",this.fill),this.video.currentTime=t,await this.fill(),this.onState("ready"),this.video.play().catch(()=>{return})}catch(i){if(this.closed)return;this.onState("error",x(i))}}close(){this.closed=!0,this.abort.abort(),this.video.removeEventListener("timeupdate",this.fill),this.video.removeEventListener("seeking",this.fill),this.attached?.detach()}async trim(){let e=this.playlist,t=this.buffer;if(!e||!t)return;let i=this.video.currentTime-qi,s=this.video.currentTime+Bt*2;if(i>0)await this.remove(0,i);if(s<e.duration)await this.remove(s,e.duration);for(let r of[...this.loaded]){let n=e.segments[r];if(n.start+n.duration<=i||n.start>=s)this.loaded.delete(r)}}async fetchBytes(e){let t=await fetch(Ht(this.playlistUrl,e),{signal:this.abort.signal});if(!t.ok)throw Error(`A part of the recording did not load (${t.status})`);return t.arrayBuffer()}append(e){return this.whenIdle(()=>this.buffer.appendBuffer(e))}remove(e,t){if(t<=e)return Promise.resolve();return this.whenIdle(()=>this.buffer.remove(e,t))}whenIdle(e){let t=this.buffer;if(!t)return Promise.resolve();return new Promise((i,s)=>{let r=()=>{t.removeEventListener("error",n),i()},n=()=>{t.removeEventListener("updateend",r),s(Error("The browser could not play this part of the recording"))};t.addEventListener("updateend",r,{once:!0}),t.addEventListener("error",n,{once:!0}),e()})}}var Je=[1,2,4];class Wt extends v{static properties={mode:{attribute:!1},paused:{attribute:!1},muted:{attribute:!1},position:{attribute:!1},duration:{attribute:!1},clockStart:{attribute:!1},rate:{attribute:!1},talk:{attribute:!1},fullscreen:{attribute:!1},rewinding:{attribute:!1},ptz:{attribute:!1},ptzOpen:{attribute:!1},dragging:{state:!0}};constructor(){super();this.mode="live",this.paused=!1,this.muted=!0,this.position=0,this.duration=0,this.rate=1,this.fullscreen=!1,this.rewinding=!1,this.ptz=!1,this.ptzOpen=!1}send(e){this.dispatchEvent(new CustomEvent("control",{detail:e,bubbles:!0,composed:!0}))}button(e,t,i,s=""){return o`<button
      class="control ${s}"
      aria-label=${t}
      title=${t}
      @click=${(r)=>{r.stopPropagation(),this.send(i)}}
    >
      <ha-icon icon=${e}></ha-icon>
    </button>`}timeLabel(e){if(this.mode==="playback"&&this.clockStart!==void 0)return new Date((this.clockStart+e)*1000).toLocaleTimeString([],{hour:"numeric",minute:"2-digit",second:"2-digit"});let t=Math.max(0,Math.floor(e));return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}render(){return this.mode==="live"?this.renderLive():this.renderPlayback()}renderLive(){let e=this.talk;return o`
      <div class="bar">
        ${this.muted?this.button("mdi:volume-off","Sound on",{action:"unmute"}):this.button("mdi:volume-high","Sound off",{action:"mute"})}
        ${e?o`<button
              class="control talk ${e.active?"active":""} ${e.available?"":"unavailable"}"
              aria-label="Hold to talk"
              title=${e.reason??"Hold to talk"}
              @pointerdown=${(t)=>{t.stopPropagation(),t.preventDefault(),t.currentTarget.setPointerCapture(t.pointerId),this.send({action:"talk-start"})}}
              @pointerup=${()=>this.send({action:"talk-stop"})}
              @pointercancel=${()=>this.send({action:"talk-stop"})}
              @contextmenu=${(t)=>t.preventDefault()}
              @click=${(t)=>t.stopPropagation()}
            >
              <ha-icon icon=${e.active?"mdi:microphone":"mdi:microphone-outline"}></ha-icon>
              <span>Hold to talk</span>
            </button>`:d}
        ${this.ptz?this.button("mdi:arrow-all",this.ptzOpen?"Close pan and tilt":"Pan and tilt",{action:"ptz"},this.ptzOpen?"on":""):d}
        <span class="spacer"></span>
        ${this.button("mdi:history",this.rewinding?"Close timeline":"Rewind",{action:"rewind"},this.rewinding?"on":"")}
        ${this.button(this.fullscreen?"mdi:fullscreen-exit":"mdi:fullscreen","Full screen",{action:"fullscreen"})}
      </div>
    `}renderPlayback(){let e=this.dragging??this.position;return o`
      <div class="bar">
        ${this.paused?this.button("mdi:play","Play",{action:"play"}):this.button("mdi:pause","Pause",{action:"pause"})}
        ${this.button("mdi:rewind-10","Back 10 seconds",{action:"skip",seconds:-10},"skip")}
        ${this.button("mdi:fast-forward-10","Forward 10 seconds",{action:"skip",seconds:10},"skip")}
        <span class="time">${this.timeLabel(e)}</span>
        <input
          class="seek"
          type="range"
          min="0"
          max=${Math.max(this.duration,0.1)}
          step="0.1"
          .value=${String(e)}
          aria-label="Position"
          @click=${(t)=>t.stopPropagation()}
          @input=${(t)=>this.dragging=Number(t.target.value)}
          @change=${(t)=>{let i=Number(t.target.value);this.dragging=void 0,this.send({action:"seek",seconds:i})}}
        />
        ${this.mode==="clip"?o`<span class="time">${this.timeLabel(this.duration)}</span>`:d}
        <button
          class="control rate"
          aria-label="Playback speed"
          @click=${(t)=>{t.stopPropagation();let i=Je[(Je.indexOf(this.rate)+1)%Je.length];this.send({action:"rate",rate:i})}}
        >
          ${this.rate}×
        </button>
        ${this.muted?this.button("mdi:volume-off","Sound on",{action:"unmute"}):this.button("mdi:volume-high","Sound off",{action:"mute"})}
        ${this.mode==="playback"?this.button("mdi:history",this.rewinding?"Close timeline":"Timeline",{action:"rewind"},`timeline-toggle ${this.rewinding?"on":""}`):d}
        ${this.button(this.fullscreen?"mdi:fullscreen-exit":"mdi:fullscreen","Full screen",{action:"fullscreen"})}
        ${this.mode==="playback"?o`<button
              class="control live"
              aria-label="Back to live"
              @click=${(t)=>{t.stopPropagation(),this.send({action:"live"})}}
            >
              <span class="dot"></span>Live
            </button>`:d}
      </div>
    `}static styles=[w,b`
      :host {
        display: block;
        container-type: inline-size;
      }
      .bar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 10px;
      }
      .spacer {
        flex: 1;
      }
      .control {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 48px;
        height: 48px;
        padding: 0 10px;
        border: 0;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.45);
        color: var(--ch-text);
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
      }
      .control:active {
        transform: scale(0.94);
      }
      .control.on {
        background: var(--ch-accent);
      }
      .control.unavailable {
        opacity: 0.45;
      }
      .talk {
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }
      .talk.active {
        background: var(--ch-red);
      }
      .rate {
        min-width: 56px;
        font-variant-numeric: tabular-nums;
      }
      .live .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ch-red);
      }
      ha-icon {
        --mdc-icon-size: 24px;
      }
      .time {
        min-width: 64px;
        padding: 0 4px;
        font-size: 13px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
        white-space: nowrap;
      }
      .seek {
        flex: 1;
        min-width: 80px;
        height: 48px;
        margin: 0 4px;
        accent-color: var(--ch-accent);
        cursor: pointer;
      }
      /* A phone: the seek bar gets its own row, and the buttons that the seek
         bar and the open timeline make unneeded are left out. */
      @container (max-width: 560px) {
        .bar {
          flex-wrap: wrap;
          row-gap: 0;
          padding: 6px 8px;
        }
        .seek {
          order: -1;
          flex: 1 0 100%;
          height: 32px;
          margin: 0;
        }
        .skip,
        .timeline-toggle {
          display: none;
        }
        .control {
          min-width: 44px;
          height: 44px;
        }
      }
    `]}customElements.define("camera-hub-player-controls",Wt);class jt extends v{static properties={hass:{attribute:!1},review:{attribute:!1},instanceId:{attribute:!1},cameraName:{attribute:!1},poster:{state:!0},vodState:{state:!0},message:{state:!0},playing:{state:!0},paused:{state:!0},muted:{state:!0},position:{state:!0},duration:{state:!0},rate:{state:!0},fullscreen:{state:!0}};constructor(){super();this.onKeyDown=(e)=>{if(e.key==="Escape")this.close()};this.onFullscreenChange=()=>{this.fullscreen=document.fullscreenElement===this.frame};this.vodState="loading",this.playing=!1,this.paused=!1,this.muted=!0,this.position=0,this.duration=0,this.rate=1,this.fullscreen=!1}get video(){return this.renderRoot.querySelector("video")}get frame(){return this.renderRoot.querySelector(".video")}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.onKeyDown),document.addEventListener("fullscreenchange",this.onFullscreenChange)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.onKeyDown),document.removeEventListener("fullscreenchange",this.onFullscreenChange),this.player?.close()}firstUpdated(){let e=this.video;e.addEventListener("playing",()=>this.playing=!0),e.addEventListener("timeupdate",()=>this.position=e.currentTime),e.addEventListener("durationchange",()=>this.duration=e.duration||0),e.addEventListener("play",()=>this.paused=!1),e.addEventListener("pause",()=>this.paused=!0),this.load()}updated(e){if(e.has("review")&&e.get("review"))this.load();if(this.video)this.video.muted=this.muted}load(){let e=this.video;if(!e)return;this.player?.close(),this.poster=void 0,this.playing=!1,this.position=0,I.get(this.hass,ye(this.instanceId,this.review)).then((s)=>this.poster=s,()=>{return});let t=At(this.instanceId,this.review);if(!t)return;let i=new ae(e,(s,r)=>{this.vodState=s,this.message=r});this.player=i,I.get(this.hass,t).then((s)=>{if(this.player===i)i.load(s)},(s)=>{this.vodState="error",this.message=x(s)})}onControl(e){let t=this.video,i=e.detail;if(!t)return;switch(i.action){case"play":t.play();break;case"pause":t.pause();break;case"seek":t.currentTime=i.seconds;break;case"skip":t.currentTime=Math.max(0,t.currentTime+i.seconds);break;case"rate":this.rate=i.rate,t.playbackRate=i.rate;break;case"mute":this.muted=!0;break;case"unmute":this.muted=!1;break;case"fullscreen":if(document.fullscreenElement)document.exitFullscreen();else this.frame?.requestFullscreen?.();break;default:break}}close(){this.dispatchEvent(new CustomEvent("clip-close",{bubbles:!0,composed:!0}))}render(){let e=new Date(this.review.start_time*1000),t=e.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),i=e.toLocaleDateString([],{weekday:"short"});return o`
      <div class="backdrop" @click=${this.close}></div>
      <div class="panel" role="dialog" aria-label="Alert clip">
        <div class="header">
          <div class="title">
            <span class="label">${H(this.review)}</span>
            <span class="meta">${this.cameraName} · ${i} ${t}</span>
          </div>
          <button class="close" @click=${this.close} aria-label="Close">
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="video">
          <video muted playsinline></video>
          ${this.poster&&!this.playing?o`<img class="poster" src=${this.poster} alt="" />`:d}
          ${this.vodState==="error"?o`<div class="message">${this.message}</div>`:!this.playing?o`<div class="spinner"></div>`:d}
          <div class="controls" @control=${this.onControl}>
            <camera-hub-player-controls
              .mode=${"clip"}
              .paused=${this.paused}
              .muted=${this.muted}
              .position=${this.position}
              .duration=${this.duration}
              .rate=${this.rate}
              .fullscreen=${this.fullscreen}
            ></camera-hub-player-controls>
          </div>
        </div>
      </div>
    `}static styles=[w,j,b`
      :host {
        position: fixed;
        inset: 0;
        z-index: 10;
        display: grid;
        place-items: center;
        padding: 16px;
      }
      .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        animation: fade 150ms ease;
      }
      .panel {
        position: relative;
        width: min(1100px, 100%, calc((100vh - 120px) * 16 / 9));
        animation: rise 180ms ease;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .title {
        display: flex;
        flex-direction: column;
      }
      .label {
        font-size: 20px;
        font-weight: 600;
      }
      .meta {
        font-size: 13px;
        color: var(--ch-text-secondary);
      }
      .close {
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        border: 0;
        border-radius: 50%;
        background: var(--ch-surface-raised);
        color: var(--ch-text);
        cursor: pointer;
        touch-action: manipulation;
      }
      .video {
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: var(--ch-radius-main);
        overflow: hidden;
        background: #000;
      }
      .video:fullscreen {
        aspect-ratio: auto;
        border-radius: 0;
      }
      video,
      .poster {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      video {
        object-fit: contain;
      }
      .poster {
        object-fit: fill;
      }
      .controls {
        position: absolute;
        inset: auto 0 0 0;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
      }
      .message {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: var(--ch-text-secondary);
      }
      @keyframes fade {
        from {
          opacity: 0;
        }
      }
      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
      }
    `]}customElements.define("camera-hub-clip-modal",jt);var Xi=[{id:"all",label:"All"},{id:"person",label:"People"},{id:"animal",label:"Animals"},{id:"vehicle",label:"Vehicles"}];class Yt extends v{static properties={hass:{attribute:!1},cameras:{attribute:!1},store:{attribute:!1},filter:{state:!0},thumbnails:{state:!0},now:{state:!0},revision:{state:!0},layout:{attribute:!1}};constructor(){super();this.cameras=[],this.filter="all",this.thumbnails={},this.now=Date.now(),this.revision=0,this.layout="row"}get instanceId(){return this.cameras[0]?.instance_id}connectedCallback(){super.connectedCallback(),this.clock=setInterval(()=>this.now=Date.now(),30000),this.listen()}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.clock),this.stopListening?.(),this.stopListening=void 0}updated(e){if(e.has("store"))this.listen()}listen(){if(!this.store||this.stopListening)return;this.stopListening=this.store.onChange(()=>{this.revision++,this.signThumbnails()}),this.signThumbnails()}signThumbnails(){let e=this.instanceId;if(!e||!this.hass)return;for(let t of this.store.reviews){if(this.thumbnails[t.id])continue;I.get(this.hass,ye(e,t)).then((i)=>this.thumbnails={...this.thumbnails,[t.id]:i},()=>{return})}}open(e){this.dispatchEvent(new CustomEvent("clip-open",{detail:e,bubbles:!0,composed:!0}))}cameraName(e){return this.cameras.find((t)=>t.frigate_name===e)?.name??e}render(){let t=(this.store?.reviews??[]).filter((i)=>Mt(i,this.filter));return o`
      <div class="header ${this.layout==="list"?"wrap":""}">
        ${this.layout==="row"?o`<span class="title">Recent alerts</span>`:d}
        <div class="chips">
          ${Xi.map((i)=>o`
              <button
                class="chip ${this.filter===i.id?"on":""}"
                @click=${()=>this.filter=i.id}
              >
                ${i.label}
              </button>
            `)}
        </div>
      </div>
      ${this.store?.error?o`<div class="empty">Alerts are not available: ${this.store.error}</div>`:t.length===0?o`<div class="empty">No alerts in the last ${this.store?.hours??24} hours.</div>`:this.layout==="list"?this.renderList(t):o`
                <div class="scroller">
                  ${t.map((i)=>this.renderClip(i))}
                </div>
              `}
    `}renderList(e){return Dt(e,this.now).map((t)=>o`
        <div class="day">${t.label}</div>
        ${t.reviews.map((i)=>{let s=this.thumbnails[i.id],r=new Date(i.start_time*1000).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),n=Ot(i);return o`
            <button class="row" @click=${()=>this.open(i)}>
              <span class="thumb">
                ${s?o`<img src=${s} alt="" loading="lazy" />`:d}
                ${n===void 0?o`<span class="now"><span class="dot"></span>Now</span>`:d}
              </span>
              <span class="text">
                <span class="row-label">${H(i)}</span>
                <span class="row-meta">${this.cameraName(i.camera)}</span>
                <span class="row-meta">${r}${n?` · ${n}`:""}</span>
              </span>
              <ha-icon class="chevron" icon="mdi:chevron-right"></ha-icon>
            </button>
          `})}
      `)}renderClip(e){let t=this.thumbnails[e.id],i=e.end_time===null;return o`
      <button class="clip" @click=${()=>this.open(e)}>
        ${t?o`<img src=${t} alt="" loading="lazy" />`:d}
        <span class="shade"></span>
        ${i?o`<span class="now"><span class="dot"></span>Now</span>`:d}
        <span class="caption">
          <span class="label">${H(e)}</span>
          <span class="meta">
            ${this.cameraName(e.camera)} · ${Rt(e.start_time,this.now)}
          </span>
        </span>
      </button>
    `}static styles=[w,b`
      :host {
        display: block;
        min-width: 0;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
      }
      .title {
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ch-text-secondary);
      }
      .chips {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .chip {
        min-height: 36px;
        padding: 0 14px;
        border: 1px solid var(--ch-hairline);
        border-radius: 999px;
        background: var(--ch-surface);
        color: var(--ch-text-secondary);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        touch-action: manipulation;
      }
      .chip.on {
        background: var(--ch-accent);
        border-color: var(--ch-accent);
        color: #fff;
      }
      .scroller {
        display: flex;
        gap: var(--ch-gap);
        overflow-x: auto;
        scroll-snap-type: x proximity;
        scrollbar-width: none;
        padding-bottom: 2px;
      }
      .clip {
        position: relative;
        flex: 0 0 176px;
        aspect-ratio: 16 / 9;
        padding: 0;
        border: 0;
        border-radius: var(--ch-radius-thumb);
        overflow: hidden;
        background: var(--ch-surface-raised);
        color: inherit;
        font: inherit;
        text-align: left;
        scroll-snap-align: start;
        cursor: pointer;
        touch-action: manipulation;
      }
      .clip:active {
        transform: scale(0.97);
      }
      .clip img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .shade {
        position: absolute;
        inset: auto 0 0 0;
        height: 60%;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
      }
      .caption {
        position: absolute;
        inset: auto 8px 6px 8px;
        display: flex;
        flex-direction: column;
      }
      .label {
        font-size: 13px;
        font-weight: 700;
      }
      .meta {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.75);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .now {
        position: absolute;
        top: 6px;
        left: 6px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.6);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .now .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--ch-red);
      }
      .empty {
        padding: 18px 4px;
        font-size: 14px;
        color: var(--ch-text-secondary);
      }
      .day {
        margin: 14px 4px 6px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ch-text-secondary);
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 84px;
        padding: 6px;
        border: 0;
        border-radius: var(--ch-radius-tile);
        background: none;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }
      .row:active {
        background: var(--ch-surface);
      }
      .thumb {
        position: relative;
        flex: none;
        width: 128px;
        aspect-ratio: 16 / 9;
        border-radius: var(--ch-radius-thumb);
        overflow: hidden;
        background: var(--ch-surface-raised);
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .row-label {
        font-size: 16px;
        font-weight: 600;
      }
      .row-meta {
        font-size: 13px;
        color: var(--ch-text-secondary);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chevron {
        flex: none;
        color: var(--ch-text-secondary);
      }
      .header.wrap .chips {
        flex-wrap: wrap;
      }
    `]}customElements.define("camera-hub-clips-strip",Yt);function q(e,t,i){let s=e.states[t]?.attributes.entity_picture;if(typeof s!=="string")return;let r=s.includes("?")?"&":"?";return e.hassUrl(`${s}${r}t=${i}`)}function xe(e,t){let i=e.states[t]?.state;return i===void 0||i==="unavailable"}async function oe(e,t){let i=`/api/frigate/${encodeURIComponent(t.instanceId)}/go2rtc/ws/api/ws?src=${encodeURIComponent(t.stream)}`,s=(await ve(e,i)).replace(/^http/,"ws"),r=new WebSocket(s);return r.binaryType="arraybuffer",await new Promise((n,a)=>{r.onopen=()=>n(),r.onerror=()=>a(Error("Could not open the stream connection"))}),r.onerror=null,r}function _e(e,t,i){if(e.readyState===WebSocket.OPEN)e.send(JSON.stringify({type:t,value:i}))}function ke(e,t){return new Promise((i,s)=>{let r=setTimeout(()=>s(Error("WebRTC timed out")),t);e.onconnectionstatechange=()=>{if(e.connectionState==="connected")clearTimeout(r),i();else if(e.connectionState==="failed"||e.connectionState==="closed")clearTimeout(r),s(Error("WebRTC failed"))}})}async function Se(e,t){t.onicecandidate=(s)=>_e(e,"webrtc/candidate",s.candidate?.candidate??""),e.addEventListener("message",(s)=>{if(typeof s.data!=="string")return;let r=JSON.parse(s.data);if(r.type==="webrtc/answer")t.setRemoteDescription({type:"answer",sdp:r.value});else if(r.type==="webrtc/candidate"&&r.value)t.addIceCandidate({candidate:r.value,sdpMid:"0"});else if(r.type==="error")t.close()});let i=await t.createOffer();await t.setLocalDescription(i),_e(e,"webrtc/offer",i.sdp??"")}function Ki(){return typeof RTCPeerConnection>"u"?["mse"]:["mse","webrtc"]}var Zi=5000,Ji=6000,Gi=30000,X="This device cannot decode the stream",qt=new Set;class le{constructor(e,t,i){this.getHass=e;this.video=t;this.onStatus=i;this.attempt=0;this.generation=0;t.muted=!0,t.playsInline=!0,t.autoplay=!0,t.addEventListener("playing",()=>{if(this.session)this.attempt=0,this.onStatus({state:"playing",mode:this.session.mode})})}play(e,t){this.stop(),this.source=e,this.fallbackStream=t??void 0,this.attempt=0,this.connect()}stop(){this.generation++,clearTimeout(this.retryTimer),this.session?.close(),this.session=void 0,this.source=void 0}async connect(){let e=this.source;if(!e)return;let t=++this.generation,i=()=>t===this.generation,s=(m)=>{if(i())this.retry(m)},r,n=(m)=>{if(r)r(m);else s(m)},a=this.fallbackStream,l=a&&qt.has(e.stream)?[a]:[e.stream];if(a&&!l.includes(a))l.push(a);this.onStatus({state:"connecting"});let p="No video arrived";for(let m of l)for(let h of Ki()){let u;try{u=await Qi(h,this.getHass(),{...e,stream:m},this.video,n)}catch(c){if(!i())return;p=x(c);continue}if(!i()){u.close();return}this.session=u;let g=await new Promise((c)=>{r=c,es(this.video,Ji).then((y)=>c(y?!0:`No video arrived over ${h.toUpperCase()}`))});if(r=void 0,!i())return;if(g===!0){if(m!==e.stream)qt.add(e.stream);return}if(u.close(),this.session=void 0,p=g,p===X)break}s(p)}retry(e){this.session?.close(),this.session=void 0;let t=Math.min(Gi,1000*2**this.attempt++);this.onStatus({state:"retrying",inSeconds:Math.round(t/1000),reason:e}),this.retryTimer=setTimeout(()=>void this.connect(),t)}}function Qi(e,t,i,s,r){return e==="mse"?is(t,i,s,r):ts(t,i,s,r)}function es(e,t){if(e.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA&&!e.paused)return Promise.resolve(!0);return new Promise((i)=>{let s=(a)=>{clearTimeout(n),e.removeEventListener("playing",r),i(a)},r=()=>s(!0),n=setTimeout(()=>s(!1),t);e.addEventListener("playing",r)})}async function ts(e,t,i,s){let[r,n]=await Promise.all([be(e,t.iceEntityId),oe(e,t)]),a=new RTCPeerConnection({iceServers:r}),l=!1,p=()=>{if(l=!0,a.close(),n.close(),i.srcObject)i.srcObject=null};a.addTransceiver("video",{direction:"recvonly"}),a.addTransceiver("audio",{direction:"recvonly"});let m=new MediaStream;a.ontrack=(u)=>{if(m.addTrack(u.track),i.srcObject!==m)i.removeAttribute("src"),i.srcObject=m},await Se(n,a);try{await ke(a,Zi)}catch(u){throw p(),u}let h=(u)=>{if(!l)p(),s(u)};return a.onconnectionstatechange=()=>{if(a.connectionState==="failed"||a.connectionState==="closed")h("The WebRTC connection was lost")},n.onclose=()=>h("The stream connection closed"),{mode:"webrtc",close:p}}async function is(e,t,i,s){let r=await oe(e,t),n;try{n=await we(i)}catch(T){throw r.close(),T}let{mediaSource:a,isTypeSupported:l}=n,p=!1,m=()=>g(X),h=()=>g(X),u=()=>{p=!0,r.close(),i.removeEventListener("error",m),a.removeEventListener("sourceclose",h),n.detach()},g=(T)=>{if(!p)u(),s(T)};i.addEventListener("error",m),a.addEventListener("sourceclose",h),_e(r,"mse",Vt(l));let c,y=[],de=()=>{if(!c||c.updating||p)return;if(a.readyState!=="open"){g(X);return}let T=y.shift();if(T){try{c.appendBuffer(T)}catch{g(X)}return}if(c.buffered.length===0)return;let P=Ft(i.currentTime,c.buffered.start(0),c.buffered.end(c.buffered.length-1));if(P.seekTo!==void 0)i.currentTime=P.seekTo;if(P.removeEnd!==void 0)c.remove(0,P.removeEnd)};return r.onmessage=(T)=>{if(typeof T.data==="string"){let P=JSON.parse(T.data);if(P.type==="mse"){if(!l(P.value)){g(X);return}c=a.addSourceBuffer(P.value),c.mode="segments",c.addEventListener("updateend",de)}else if(P.type==="error")g(P.value);return}y.push(T.data),de()},r.onclose=()=>g("The stream connection closed"),{mode:"mse",close:u}}var ss=8000,rs=30000;function V(){if(!window.isSecureContext)return"Talk needs Home Assistant over HTTPS";if(!navigator.mediaDevices?.getUserMedia)return"This browser cannot use the microphone";if(typeof RTCPeerConnection>"u")return"This browser cannot send audio";return}class ce{constructor(e,t){this.getHass=e;this.onUpdate=t;this.pressed=!1}async press(e){if(this.pressed=!0,clearTimeout(this.closeTimer),this.source&&this.source.stream!==e.stream)this.close();this.source=e;try{if(!this.pc)this.onUpdate({phase:"connecting",level:0}),this.connecting??=this.connect(e),await this.connecting;if(!this.pressed)return;this.setMicrophone(!0),this.onUpdate({phase:"talking",level:0}),this.startMeter()}catch(t){this.close(),this.onUpdate({phase:"error",level:0,message:ns(t)})}}release(){if(this.pressed=!1,this.setMicrophone(!1),this.stopMeter(),this.pc)this.onUpdate({phase:"idle",level:0});clearTimeout(this.closeTimer),this.closeTimer=setTimeout(()=>this.close(),rs)}close(){clearTimeout(this.closeTimer),this.stopMeter(),this.pc?.close(),this.ws?.close();for(let e of this.microphone?.getTracks()??[])e.stop();this.audio?.close().catch(()=>{return}),this.pc=void 0,this.ws=void 0,this.microphone=void 0,this.audio=void 0,this.connecting=void 0}async connect(e){let t=V();if(t)throw Error(t);let i=this.getHass(),[s,r,n]=await Promise.all([navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),be(i,e.iceEntityId),oe(i,e)]);this.microphone=s,this.ws=n;let a=new RTCPeerConnection({iceServers:r});this.pc=a;for(let l of s.getAudioTracks())l.enabled=!1,a.addTransceiver(l,{direction:"sendonly"});await Se(n,a),await ke(a,ss),a.onconnectionstatechange=()=>{if(a.connectionState==="failed"||a.connectionState==="closed")this.close(),this.onUpdate({phase:"idle",level:0})}}setMicrophone(e){for(let t of this.microphone?.getAudioTracks()??[])t.enabled=e}startMeter(){let e=this.microphone;if(!e||this.meterFrame!==void 0)return;this.audio??=new AudioContext;let t=this.audio.createAnalyser();t.fftSize=512,this.audio.createMediaStreamSource(e).connect(t);let i=new Uint8Array(t.fftSize),s=()=>{t.getByteTimeDomainData(i);let r=0;for(let n of i)r=Math.max(r,Math.abs(n-128));this.onUpdate({phase:"talking",level:Math.min(1,r/64)}),this.meterFrame=requestAnimationFrame(s)};this.meterFrame=requestAnimationFrame(s)}stopMeter(){if(this.meterFrame!==void 0)cancelAnimationFrame(this.meterFrame);this.meterFrame=void 0}}function ns(e){let t=e.name;if(t==="NotAllowedError")return"Allow the microphone for Home Assistant to talk";if(t==="NotFoundError")return"No microphone found";return x(e)}var as=[0.15,0.35,0.55,0.75,0.9];class Xt extends v{static properties={talk:{attribute:!1}};render(){let e=this.talk;if(!e||e.phase==="idle")return d;if(e.phase==="error")return o`<div class="banner error">
        <ha-icon icon="mdi:microphone-off"></ha-icon>${e.message}
      </div>`;return o`
      <div class="banner">
        <ha-icon icon="mdi:microphone"></ha-icon>
        <span>${e.phase==="connecting"?"Connecting microphone…":"Talking"}</span>
        <span class="meter" aria-hidden="true">
          ${as.map((t)=>o`<span class="bar ${e.level>=t?"lit":""}"></span>`)}
        </span>
        <span class="hint">Release to stop</span>
      </div>
    `}static styles=[w,b`
      :host {
        position: absolute;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
        pointer-events: none;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 18px;
        border-radius: 999px;
        background: var(--ch-red);
        color: #fff;
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
        animation: drop 150ms ease;
        --mdc-icon-size: 22px;
      }
      .banner.error {
        background: var(--ch-amber);
        color: #000;
        font-size: 14px;
      }
      .hint {
        font-size: 12px;
        font-weight: 600;
        opacity: 0.8;
      }
      .meter {
        display: inline-flex;
        align-items: flex-end;
        gap: 3px;
        height: 18px;
      }
      .bar {
        width: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.35);
      }
      .bar:nth-child(1) {
        height: 6px;
      }
      .bar:nth-child(2) {
        height: 9px;
      }
      .bar:nth-child(3) {
        height: 12px;
      }
      .bar:nth-child(4) {
        height: 15px;
      }
      .bar:nth-child(5) {
        height: 18px;
      }
      .bar.lit {
        background: #fff;
      }
      @keyframes drop {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
      }
    `]}customElements.define("camera-hub-talk-banner",Xt);var Ge=60000;class Kt extends v{static properties={hass:{attribute:!1},camera:{attribute:!1},activeEntity:{attribute:!1},status:{state:!0},talkUpdate:{state:!0},muted:{state:!0},now:{state:!0}};constructor(){super();this.talk=new ce(()=>this.hass,(e)=>this.talkUpdate=e);this.closeAt=Date.now()+Ge;this.status={state:"connecting"},this.talkUpdate={phase:"idle",level:0},this.muted=!0,this.now=Date.now(),this.addEventListener("pointerdown",()=>this.keepOpen())}connectedCallback(){super.connectedCallback(),this.keepOpen(),this.clock=setInterval(()=>this.tick(),250)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.clock),this.player?.stop(),this.talk.close()}firstUpdated(){let e=this.renderRoot.querySelector("video");this.player=new le(()=>this.hass,e,(t)=>this.status=t),this.player.play({instanceId:this.camera.instance_id,stream:this.camera.stream,iceEntityId:this.camera.entity_id})}willUpdate(e){let t=this.attribute("started_at");if(e.has("hass")&&t!==this.startedAt)this.startedAt=t,this.keepOpen()}updated(){let e=this.renderRoot.querySelector("video");if(e)e.muted=this.muted}attribute(e){let t=this.hass.states[this.activeEntity]?.attributes[e];return typeof t==="string"?t:void 0}keepOpen(){this.closeAt=Date.now()+Ge}tick(){if(this.now=Date.now(),this.talkUpdate.phase==="talking"||this.talkUpdate.phase==="connecting")this.keepOpen();else if(this.now>=this.closeAt)this.dismiss()}dismiss(){clearInterval(this.clock),this.hass.callService("camera_hub","dismiss_doorbell")}startTalking(e){e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId);let t=V();if(t){this.talkUpdate={phase:"error",level:0,message:t};return}this.talk.press({instanceId:this.camera.instance_id,stream:this.camera.stream,iceEntityId:this.camera.entity_id})}stopTalking(){if(this.talk.release(),this.talkUpdate.phase==="error")setTimeout(()=>this.talkUpdate={phase:"idle",level:0},4000)}headline(){let e=this.attribute("trigger"),t=Date.parse(this.attribute("started_at")??""),i=Number.isNaN(t)?0:Math.max(0,Math.floor((this.now-t)/1000)),s=`${Math.floor(i/60)}:${String(i%60).padStart(2,"0")} ago`;return e==="ring"?`The doorbell rang · ${s}`:`Someone is at the door · ${s}`}render(){let e=this.status.state==="playing",t=e?void 0:q(this.hass,this.camera.entity_id,0),i=Math.max(0,Math.min(1,(this.closeAt-this.now)/Ge)),s=this.talkUpdate.phase==="talking"||this.talkUpdate.phase==="connecting";return o`
      <div class="panel" role="dialog" aria-label="Doorbell">
        <div class="header">
          <div>
            <div class="name">${this.camera.name}</div>
            <div class="when">${this.headline()}</div>
          </div>
        </div>
        <div class="frame">
          <video muted playsinline autoplay></video>
          ${t?o`<img class="snapshot" src=${t} alt="" />`:d}
          ${!e?o`<div class="spinner"></div>`:d}
          <camera-hub-talk-banner .talk=${this.talkUpdate}></camera-hub-talk-banner>
        </div>
        <div class="actions">
          ${this.camera.talk?o`<button
                class="action talk ${s?"active":""} ${V()?"unavailable":""}"
                @pointerdown=${this.startTalking}
                @pointerup=${this.stopTalking}
                @pointercancel=${this.stopTalking}
                @contextmenu=${(r)=>r.preventDefault()}
              >
                <ha-icon icon=${s?"mdi:microphone":"mdi:microphone-outline"}></ha-icon>
                Hold to talk
              </button>`:d}
          <button class="action" @click=${()=>this.muted=!this.muted}>
            <ha-icon icon=${this.muted?"mdi:volume-off":"mdi:volume-high"}></ha-icon>
            ${this.muted?"Sound on":"Sound off"}
          </button>
          <button class="action dismiss" @click=${this.dismiss}>
            <ha-icon icon="mdi:close"></ha-icon>
            Dismiss
          </button>
        </div>
        <div class="countdown" style="transform: scaleX(${i})"></div>
      </div>
    `}static styles=[w,j,b`
      :host {
        position: fixed;
        inset: 0;
        z-index: 20;
        display: grid;
        place-items: center;
        padding: 16px;
        background: rgba(0, 0, 0, 0.88);
        animation: fade 180ms ease;
      }
      .panel {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 14px;
        /* The header, the buttons and the countdown need about 200 px of the
           height; the video gets the rest. */
        width: min(1200px, 100%, calc((100vh - 240px) * 16 / 9));
      }
      .name {
        font-size: 30px;
        font-weight: 700;
      }
      .when {
        font-size: 16px;
        color: var(--ch-text-secondary);
        font-variant-numeric: tabular-nums;
      }
      .frame {
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: var(--ch-radius-main);
        overflow: hidden;
        background: #000;
      }
      video,
      .snapshot {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      video {
        object-fit: contain;
      }
      .snapshot {
        object-fit: fill;
      }
      .actions {
        display: flex;
        gap: 12px;
      }
      .action {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        height: 72px;
        border: 0;
        border-radius: 999px;
        background: var(--ch-surface-raised);
        color: var(--ch-text);
        font: inherit;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        --mdc-icon-size: 28px;
      }
      .action:active {
        transform: scale(0.97);
      }
      .talk {
        flex: 2;
        background: var(--ch-accent);
      }
      .talk.active {
        background: var(--ch-red);
      }
      .talk.unavailable {
        opacity: 0.45;
      }
      .dismiss {
        background: transparent;
        border: 2px solid rgba(255, 255, 255, 0.25);
      }
      /* A phone: Hold to talk gets a full-width row, the other buttons share
         the row under it. */
      @media (max-width: 600px) {
        .name {
          font-size: 24px;
        }
        .actions {
          flex-wrap: wrap;
        }
        .action {
          height: 60px;
          font-size: 16px;
        }
        .talk {
          flex: 1 0 100%;
        }
      }
      .countdown {
        height: 3px;
        border-radius: 2px;
        background: var(--ch-text-secondary);
        transform-origin: left;
        transition: transform 250ms linear;
      }
      @keyframes fade {
        from {
          opacity: 0;
        }
      }
    `]}customElements.define("camera-hub-doorbell-overlay",Kt);async function Zt(e,t,i){let s=await e.callWS({type:"frigate/ptz/info",instance_id:t,camera:i}),r=typeof s==="string"?JSON.parse(s):s;return{features:r.features??[],presets:r.presets??[]}}function $e(e,t,i,s=""){return e.callService("frigate","ptz",{action:i,argument:s},{entity_id:t})}var os=[{move:"up",icon:"mdi:chevron-up",label:"Tilt up"},{move:"left",icon:"mdi:chevron-left",label:"Pan left"},{move:"right",icon:"mdi:chevron-right",label:"Pan right"},{move:"down",icon:"mdi:chevron-down",label:"Tilt down"}];class Jt extends v{static properties={hass:{attribute:!1},camera:{attribute:!1},info:{state:!0},moving:{state:!0}};willUpdate(e){let t=e.get("camera");if(e.has("camera")&&t?.entity_id!==this.camera.entity_id)this.info=void 0,Zt(this.hass,this.camera.instance_id,this.camera.frigate_name).then((i)=>this.info=i,()=>this.info={features:["pt"],presets:[]})}disconnectedCallback(){if(super.disconnectedCallback(),this.moving)this.stop()}start(e,t,i){e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),this.moving=`${t}-${i}`,$e(this.hass,this.camera.entity_id,t,i)}stop(e){if(e?.stopPropagation(),!this.moving)return;this.moving=void 0,$e(this.hass,this.camera.entity_id,"stop")}holdButton(e,t,i,s,r=""){return o`<button
      class="hold ${r} ${this.moving===`${e}-${t}`?"pressed":""}"
      aria-label=${s}
      @pointerdown=${(n)=>this.start(n,e,t)}
      @pointerup=${(n)=>this.stop(n)}
      @pointercancel=${(n)=>this.stop(n)}
      @contextmenu=${(n)=>n.preventDefault()}
      @click=${(n)=>n.stopPropagation()}
    >
      <ha-icon icon=${i}></ha-icon>
    </button>`}goToPreset(e,t){e.stopPropagation(),$e(this.hass,this.camera.entity_id,"preset",t)}render(){let e=this.info?.features.includes("zoom")??!1,t=this.info?.presets??[],i=t.find((r)=>r.toLowerCase()==="home"),s=t.filter((r)=>r!==i);return o`
      <div class="pad" @pointerdown=${(r)=>r.stopPropagation()}>
        <div class="dpad">
          ${os.map((r)=>this.holdButton("move",r.move,r.icon,r.label,r.move))}
          ${i?o`<button
                class="home"
                aria-label="Go to the home position"
                @click=${(r)=>this.goToPreset(r,i)}
              >
                <ha-icon icon="mdi:home"></ha-icon>
              </button>`:d}
        </div>
        ${e?o`<div class="zoom">
              ${this.holdButton("zoom","in","mdi:plus","Zoom in")}
              ${this.holdButton("zoom","out","mdi:minus","Zoom out")}
            </div>`:d}
        ${s.length?o`<div class="presets">
              ${s.map((r)=>o`<button class="preset" @click=${(n)=>this.goToPreset(n,r)}>
                  <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
                  ${r}
                </button>`)}
            </div>`:d}
      </div>
    `}static styles=[w,b`
      :host {
        display: block;
      }
      .pad {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      .dpad {
        position: relative;
        width: 168px;
        height: 168px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.45);
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
      }
      .hold {
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--ch-text);
        cursor: pointer;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        --mdc-icon-size: 32px;
      }
      .dpad .hold {
        position: absolute;
      }
      .home {
        position: absolute;
        top: 60px;
        left: 60px;
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.16);
        color: var(--ch-text);
        cursor: pointer;
        touch-action: manipulation;
        --mdc-icon-size: 24px;
      }
      .home:active {
        background: var(--ch-accent);
      }
      .hold.pressed {
        background: var(--ch-accent);
      }
      .up {
        top: 4px;
        left: 56px;
      }
      .down {
        bottom: 4px;
        left: 56px;
      }
      .left {
        left: 4px;
        top: 56px;
      }
      .right {
        right: 4px;
        top: 56px;
      }
      .zoom,
      .presets {
        display: flex;
        gap: 8px;
      }
      .zoom .hold {
        background: rgba(0, 0, 0, 0.45);
      }
      .preset {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        padding: 0 14px;
        border: 0;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.45);
        color: var(--ch-text);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        text-transform: capitalize;
        cursor: pointer;
        --mdc-icon-size: 18px;
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
      }
    `]}customElements.define("camera-hub-ptz-pad",Jt);var Gt=180,ls=4000,cs=1800,ds=15;class Qt extends v{static properties={hass:{attribute:!1},camera:{attribute:!1},snapshotRefresh:{attribute:!1},timelineOpen:{attribute:!1},statuses:{state:!0},shown:{state:!0},playback:{state:!0},vodState:{state:!0},vodMessage:{state:!0},muted:{state:!0},paused:{state:!0},position:{state:!0},duration:{state:!0},rate:{state:!0},controlsVisible:{state:!0},fullscreen:{state:!0},talkUpdate:{state:!0},ptzOpen:{state:!0}};constructor(){super();this.talk=new ce(()=>this.hass,(e)=>this.talkUpdate=e);this.players=[];this.target=0;this.onVisibilityChange=()=>{if(document.hidden)this.stopLive(),this.vodVideo?.pause();else if(!this.playback)this.startLive()};this.onFullscreenChange=()=>{this.fullscreen=document.fullscreenElement===this.frame};this.timelineOpen=!1,this.statuses=[{state:"connecting"},{state:"connecting"}],this.shown=0,this.vodState="loading",this.muted=!0,this.paused=!1,this.position=0,this.duration=0,this.rate=1,this.controlsVisible=!1,this.fullscreen=!1,this.talkUpdate={phase:"idle",level:0},this.ptzOpen=!1}get frame(){return this.renderRoot.querySelector(".frame")}get vodVideo(){return this.renderRoot.querySelector("video.vod")}connectedCallback(){if(super.connectedCallback(),document.addEventListener("visibilitychange",this.onVisibilityChange),document.addEventListener("fullscreenchange",this.onFullscreenChange),this.players.length)this.startLive(),this.reportPosition(null)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("visibilitychange",this.onVisibilityChange),document.removeEventListener("fullscreenchange",this.onFullscreenChange),clearTimeout(this.hideTimer),this.stopLive(),this.closeVod(),this.playback=void 0,this.talk.close()}firstUpdated(){let e=[...this.renderRoot.querySelectorAll("video.live")];this.players=e.map((i,s)=>new le(()=>this.hass,i,(r)=>this.onStatus(s,r)));let t=this.vodVideo;t.addEventListener("timeupdate",()=>{if(this.position=t.currentTime,this.playback)this.reportPosition(this.playback.windowStart+t.currentTime)}),t.addEventListener("durationchange",()=>this.duration=t.duration||0),t.addEventListener("play",()=>this.paused=!1),t.addEventListener("pause",()=>this.paused=!0),t.addEventListener("ended",()=>this.onPlaybackEnded()),this.startLive(),this.reportPosition(null)}updated(e){let t=e.get("camera");if(e.has("camera")&&t&&t.entity_id!==this.camera?.entity_id){if(this.playback)this.goLive();else this.switchCamera();this.ptzOpen=!1,this.talk.close(),this.talkUpdate={phase:"idle",level:0}}for(let i of this.renderRoot.querySelectorAll("video"))i.muted=this.muted}showControls(){this.controlsVisible=!0,clearTimeout(this.hideTimer),this.hideTimer=setTimeout(()=>{if(!(this.timelineOpen||this.ptzOpen||this.talkUpdate.phase!=="idle"||this.playback&&this.paused))this.controlsVisible=!1},ls)}onStatus(e,t){let i=[...this.statuses];if(i[e]=t,this.statuses=i,e===this.target&&t.state==="playing"&&this.shown!==e){let s=this.shown;this.shown=e,setTimeout(()=>{if(this.target!==s)this.players[s]?.stop()},Gt+50)}}source(){if(!this.camera)return;return{instanceId:this.camera.instance_id,stream:this.camera.stream,iceEntityId:this.camera.entity_id}}startLive(){let e=this.source();if(!e||document.hidden)return;this.target=this.shown,this.players[this.target]?.play(e,this.camera?.fallback_stream)}switchCamera(){let e=this.source();if(!e||document.hidden)return;if(this.statuses[this.shown].state!=="playing"){this.startLive();return}this.target=this.shown===0?1:0,this.players[this.target]?.play(e,this.camera?.fallback_stream)}stopLive(){for(let e of this.players)e.stop();this.statuses=[{state:"connecting"},{state:"connecting"}]}rewindTo(e){let t=this.camera,i=this.vodVideo;if(!t||!i)return;let s=Date.now()/1000-ds;if(e>=s-5){this.goLive();return}let r=Math.floor(e-5),n=Math.floor(Math.min(s,e+cs));this.stopLive(),this.closeVod(),this.playback={windowStart:r,windowEnd:n},this.position=e-r,this.duration=n-r,i.playbackRate=this.rate;let a=new ae(i,(p,m)=>{this.vodState=p,this.vodMessage=m});this.vod=a;let l=Ye(t.instance_id,t.frigate_name,r,n);I.get(this.hass,l).then((p)=>{if(this.vod===a)a.load(p,e-r)},(p)=>{this.vodState="error",this.vodMessage=x(p)})}playRecording(e){if(!this.seekInWindow(e))this.rewindTo(e)}previewRecording(e){this.seekInWindow(e)}seekInWindow(e){let t=this.playback,i=this.vodVideo;if(!t||!i||this.vodState!=="ready")return!1;if(e<t.windowStart||e>t.windowEnd-5)return!1;return i.currentTime=e-t.windowStart,!0}reportPosition(e){this.dispatchEvent(new CustomEvent("playback-position",{detail:e,bubbles:!0,composed:!0}))}onPlaybackEnded(){let e=this.playback;if(!e)return;this.rewindTo(e.windowEnd)}goLive(){this.closeVod(),this.playback=void 0,this.reportPosition(null),this.rate=1,this.startLive()}closeVod(){this.vod?.close(),this.vod=void 0}onControl(e){this.showControls();let t=this.vodVideo,i=e.detail;switch(i.action){case"mute":this.muted=!0;break;case"unmute":this.muted=!1;break;case"play":t?.play();break;case"pause":t?.pause();break;case"seek":if(t)t.currentTime=i.seconds;break;case"skip":if(t)t.currentTime=Math.max(0,t.currentTime+i.seconds);break;case"rate":if(this.rate=i.rate,t)t.playbackRate=i.rate;break;case"rewind":this.dispatchEvent(new CustomEvent("timeline-toggle",{bubbles:!0,composed:!0}));break;case"live":this.goLive();break;case"fullscreen":this.toggleFullscreen();break;case"talk-start":{let s=this.source(),r=V();if(clearTimeout(this.talkErrorTimer),r)this.talkUpdate={phase:"error",level:0,message:r};else if(s)this.talk.press(s);break}case"talk-stop":if(this.talk.release(),this.talkUpdate.phase==="error")this.talkErrorTimer=setTimeout(()=>this.talkUpdate={phase:"idle",level:0},4000);break;case"ptz":this.ptzOpen=!this.ptzOpen;break}}async toggleFullscreen(){let e=this.frame;if(!e)return;if(document.fullscreenElement)await document.exitFullscreen();else if(e.requestFullscreen)await e.requestFullscreen();else(this.playback?this.vodVideo:this.renderRoot.querySelectorAll("video.live")[this.shown])?.webkitEnterFullscreen?.()}talkState(){if(!this.camera?.talk)return;let e=V();return{available:!e,active:this.talkUpdate.phase==="talking"||this.talkUpdate.phase==="connecting",reason:e}}render(){let e=this.camera,t=this.statuses[this.target],i=!this.playback,s=i?t.state==="playing":this.vodState==="ready",r=e?xe(this.hass,e.entity_id):!1,n=e&&!r&&i?q(this.hass,e.entity_id,this.snapshotRefresh):void 0,a=this.playback?new Date((this.playback.windowStart+this.position)*1000).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):void 0,l=r?"This camera is offline.":i&&t.state==="retrying"?`${t.reason}. Trying again in ${t.inSeconds} s.`:!i&&this.vodState==="error"?this.vodMessage:void 0,p=this.controlsVisible||this.timelineOpen||this.ptzOpen||this.talkUpdate.phase!=="idle"||!i&&this.paused;return o`
      <div class="view">
      <div class="frame" @pointerdown=${()=>this.showControls()}>
        <video class="live ${i&&this.shown===0?"on":""}" muted playsinline autoplay></video>
        <video class="live ${i&&this.shown===1?"on":""}" muted playsinline autoplay></video>
        <video class="vod ${i?"":"on"}" muted playsinline></video>
        ${n?o`<img class="snapshot ${s?"faded":""}" src=${n} alt="" />`:d}
        <div class="shade top"></div>
        <div class="overlay top">
          ${i?o`<span class="badge ${s?"live":""}">
                <span class="dot"></span>${s?"Live":r?"Offline":"Connecting"}
              </span>`:o`<span class="badge recording"><ha-icon icon="mdi:history"></ha-icon>${a}</span>`}
          <span class="name">${e?.name??""}</span>
        </div>
        ${l?o`<div class="message">${l}</div>`:d}
        <camera-hub-talk-banner .talk=${this.talkUpdate}></camera-hub-talk-banner>
        ${i&&this.ptzOpen&&e?.ptz?o`<camera-hub-ptz-pad class="ptz" .hass=${this.hass} .camera=${e}></camera-hub-ptz-pad>`:d}
        ${!s&&!r&&!l?o`<div class="spinner ${n?"corner":""}"></div>`:d}
      </div>
        <div class="chrome ${p?"visible":""}" @control=${this.onControl}>
          <div class="shade bottom"></div>
          <camera-hub-player-controls
            .mode=${i?"live":"playback"}
            .paused=${this.paused}
            .muted=${this.muted}
            .position=${this.position}
            .duration=${this.duration}
            .clockStart=${this.playback?.windowStart}
            .rate=${this.rate}
            .fullscreen=${this.fullscreen}
            .rewinding=${this.timelineOpen}
            .talk=${i?this.talkState():void 0}
            .ptz=${i&&(e?.ptz??!1)}
            .ptzOpen=${this.ptzOpen}
          ></camera-hub-player-controls>
        </div>
      </div>
    `}static styles=[w,j,b`
      :host {
        display: block;
      }
      .view {
        position: relative;
        container-type: inline-size;
      }
      .frame {
        position: relative;
        aspect-ratio: 16 / 9;
        background: #000;
        border-radius: var(--ch-radius-main);
        overflow: hidden;
      }
      .frame:fullscreen {
        aspect-ratio: auto;
        border-radius: 0;
      }
      video,
      .snapshot {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      video {
        visibility: hidden;
      }
      video.on {
        visibility: visible;
      }
      /* Frigate's stills come from the detect stream, which can be a squeezed
         copy of the 16:9 picture (for example 704x480). Stretching it to the
         frame matches the live video. */
      .snapshot {
        object-fit: fill;
        background: #000;
        transition: opacity ${Gt}ms ease;
      }
      .snapshot.faded {
        opacity: 0;
      }
      .shade {
        position: absolute;
        left: 0;
        right: 0;
        pointer-events: none;
      }
      .shade.top {
        top: 0;
        height: 72px;
        background: linear-gradient(rgba(0, 0, 0, 0.55), transparent);
      }
      .shade.bottom {
        bottom: 0;
        height: 160px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
      }
      .overlay.top {
        position: absolute;
        inset: 14px 16px auto 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .name {
        font-size: 20px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.5);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-variant-numeric: tabular-nums;
      }
      .badge .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ch-text-secondary);
      }
      .badge.live .dot {
        background: var(--ch-red);
      }
      .badge.recording {
        background: var(--ch-amber);
        color: #000;
        --mdc-icon-size: 14px;
      }
      .message {
        position: absolute;
        inset: auto 16px 80px 16px;
        padding: 10px 14px;
        border-radius: var(--ch-radius-thumb);
        background: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }
      /* Over a snapshot the spinner moves out of the way. */
      .spinner.corner {
        top: 18px;
        left: auto;
        right: 18px;
        width: 22px;
        height: 22px;
        margin: 0;
        border-width: 2px;
      }
      .ptz {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
      }
      .chrome {
        position: absolute;
        inset: auto 0 0 0;
        opacity: 0;
        pointer-events: none;
        transition: opacity 200ms ease;
      }
      .chrome.visible {
        opacity: 1;
        pointer-events: auto;
      }
      .chrome > :not(.shade) {
        position: relative;
      }
      /* On a phone the controls sit under the video, always visible, so they
         cover nothing and need no tap to appear. */
      @container (max-width: 600px) {
        .chrome {
          position: static;
          opacity: 1;
          pointer-events: auto;
        }
        .chrome .shade {
          display: none;
        }
        .name {
          font-size: 16px;
        }
        .ptz {
          right: 8px;
          transform: translateY(-50%) scale(0.8);
          transform-origin: right center;
        }
      }
    `]}customElements.define("camera-hub-main-view",Qt);var ei=[{minutes:15,label:"15m"},{minutes:30,label:"30m"},{minutes:60,label:"1h"},{minutes:120,label:"2h"}],Ee="all";class ti extends v{static properties={hass:{attribute:!1},zones:{attribute:!1},open:{state:!0},now:{state:!0},layout:{attribute:!1}};constructor(){super();this.zones=[],this.now=Date.now(),this.layout="row"}connectedCallback(){super.connectedCallback(),this.clock=setInterval(()=>this.now=Date.now(),15000)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.clock)}pausedUntil(e){if((e.switch_entity?this.hass.states[e.switch_entity]?.state:void 0)!=="off")return;let i=e.paused_until_entity?Date.parse(this.hass.states[e.paused_until_entity]?.state??""):Number.NaN;return Number.isNaN(i)?void 0:i}remaining(e){let t=Math.max(1,Math.ceil((e-this.now)/60000));if(t<60)return`${t}m`;let i=Math.floor(t/60),s=t%60;return s?`${i}h ${s}m`:`${i}h`}call(e,t,i){this.hass.callService("camera_hub",e,i?{zone:t,minutes:i}:{zone:t}),this.open=void 0}render(){let e=this.zones.filter((s)=>s.notify);if(e.length===0)return d;if(this.layout==="list")return this.renderList(e);let t=e.find((s)=>s.id===this.open),i=e.some((s)=>this.pausedUntil(s)!==void 0);return o`
      <div class="row">
        <span class="title">Phone alerts</span>
        <div class="chips">
          ${e.map((s)=>{let r=this.pausedUntil(s);return o`
              <button
                class="chip ${r?"paused":""} ${this.open===s.id?"open":""}"
                @click=${()=>this.open=this.open===s.id?void 0:s.id}
              >
                <ha-icon icon=${r?"mdi:bell-sleep":"mdi:bell-ring-outline"}></ha-icon>
                ${s.name}
                <span class="state">${r?`Paused · ${this.remaining(r)}`:"On"}</span>
              </button>
            `})}
          ${e.length>1?o`<button
                class="chip ${this.open===Ee?"open":""}"
                @click=${()=>this.open=this.open===Ee?void 0:Ee}
              >
                All
              </button>`:d}
        </div>
      </div>
      ${this.open?o`
            <div class="row options">
              <span class="title">
                ${t?`Pause ${t.name}`:"Pause all zones"}
              </span>
              <div class="chips">
                ${ei.map((s)=>o`<button
                    class="chip"
                    @click=${()=>this.call("pause_zone",this.open,s.minutes)}
                  >
                    ${s.label}
                  </button>`)}
                ${(t?this.pausedUntil(t):i)?o`<button class="chip resume" @click=${()=>this.call("resume_zone",this.open)}>
                      <ha-icon icon="mdi:bell-ring-outline"></ha-icon>Resume
                    </button>`:d}
              </div>
            </div>
          `:d}
    `}durationButtons(e,t){return o`
      <div class="chips wrap">
        ${ei.map((i)=>o`<button class="chip" @click=${()=>this.call("pause_zone",e,i.minutes)}>
              ${i.label}
            </button>`)}
        ${t?o`<button class="chip resume" @click=${()=>this.call("resume_zone",e)}>
              <ha-icon icon="mdi:bell-ring-outline"></ha-icon>Resume
            </button>`:d}
      </div>
    `}renderList(e){let t=e.some((i)=>this.pausedUntil(i)!==void 0);return o`
      <p class="intro">Pause the phone notifications of a zone. The cameras keep recording.</p>
      ${e.map((i)=>{let s=this.pausedUntil(i);return o`
          <div class="zone ${s?"paused":""}">
            <div class="zone-head">
              <ha-icon icon=${s?"mdi:bell-sleep":"mdi:bell-ring-outline"}></ha-icon>
              <span class="zone-name">${i.name}</span>
              <span class="zone-state">${s?`Paused · ${this.remaining(s)} left`:"Alerts on"}</span>
            </div>
            ${this.durationButtons(i.id,s!==void 0)}
          </div>
        `})}
      ${e.length>1?o`
            <div class="zone">
              <div class="zone-head">
                <ha-icon icon="mdi:bell-off-outline"></ha-icon>
                <span class="zone-name">All zones</span>
              </div>
              ${this.durationButtons(Ee,t)}
            </div>
          `:d}
    `}static styles=[w,b`
      :host {
        display: block;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .options {
        margin-top: 8px;
        animation: open 150ms ease;
      }
      .title {
        flex: none;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ch-text-secondary);
      }
      .chips {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 40px;
        padding: 0 14px;
        border: 1px solid var(--ch-hairline);
        border-radius: 999px;
        background: var(--ch-surface);
        color: var(--ch-text);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        touch-action: manipulation;
        --mdc-icon-size: 18px;
      }
      .chip:active {
        transform: scale(0.96);
      }
      .chip .state {
        font-weight: 500;
        color: var(--ch-text-secondary);
        font-variant-numeric: tabular-nums;
      }
      .chip.paused {
        border-color: rgba(255, 176, 32, 0.5);
        color: var(--ch-amber);
      }
      .chip.paused .state {
        color: var(--ch-amber);
      }
      .chip.open {
        border-color: var(--ch-accent);
      }
      .chip.resume {
        background: var(--ch-accent);
        border-color: var(--ch-accent);
        color: #fff;
      }
      @keyframes open {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
      }
      .intro {
        margin: 6px 4px 12px;
        font-size: 14px;
        color: var(--ch-text-secondary);
      }
      .zone {
        padding: 14px;
        margin-bottom: 10px;
        border-radius: var(--ch-radius-tile);
        background: var(--ch-surface);
      }
      .zone-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        --mdc-icon-size: 22px;
      }
      .zone-name {
        font-size: 16px;
        font-weight: 600;
      }
      .zone-state {
        margin-left: auto;
        font-size: 14px;
        color: var(--ch-text-secondary);
        font-variant-numeric: tabular-nums;
      }
      .zone.paused .zone-head,
      .zone.paused .zone-state {
        color: var(--ch-amber);
      }
      .chips.wrap {
        flex-wrap: wrap;
        overflow: visible;
      }
      .chips.wrap .chip {
        min-height: 44px;
        min-width: 64px;
        justify-content: center;
      }
    `]}customElements.define("camera-hub-pause-bar",ti);class ii extends v{static properties={hass:{attribute:!1},cameras:{attribute:!1},selected:{attribute:!1},refresh:{attribute:!1},alerting:{attribute:!1}};constructor(){super();this.cameras=[],this.refresh=0,this.alerting=new Set}select(e){this.dispatchEvent(new CustomEvent("camera-select",{detail:e,bubbles:!0,composed:!0}))}render(){return o`
      <div class="rail">
        ${this.cameras.map((e)=>{let t=xe(this.hass,e.entity_id),i=t?void 0:q(this.hass,e.entity_id,this.refresh);return o`
            <button
              class="tile ${e.entity_id===this.selected?"selected":""}"
              @click=${()=>this.select(e.entity_id)}
            >
              <span class="name">${e.name}</span>
              <span class="image">
                ${this.alerting.has(e.frigate_name)?o`<span class="alert" title="Alert now"><ha-icon icon="mdi:walk"></ha-icon></span>`:""}
                ${i?o`<img src=${i} alt="" loading="lazy" />`:o`<span class="offline">${t?"Offline":""}</span>`}
              </span>
            </button>
          `})}
      </div>
    `}static styles=[w,b`
      :host {
        display: block;
      }
      .rail {
        display: grid;
        grid-template-columns: repeat(var(--ch-rail-columns, 2), minmax(0, 1fr));
        gap: var(--ch-gap);
      }
      .tile {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 0;
        border: 0;
        background: none;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }
      .tile:active .image {
        transform: scale(0.97);
      }
      .name {
        padding: 0 2px;
        font-size: 13px;
        font-weight: 600;
        color: var(--ch-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .selected .name {
        color: var(--ch-accent);
      }
      .image {
        position: relative;
        display: block;
        aspect-ratio: 16 / 9;
        border-radius: var(--ch-radius-tile);
        overflow: hidden;
        background: var(--ch-surface-raised);
        outline: 2px solid transparent;
        outline-offset: 2px;
        transition:
          outline-color 150ms,
          transform 100ms;
      }
      .selected .image {
        outline-color: var(--ch-accent);
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .alert {
        position: absolute;
        top: 6px;
        right: 6px;
        z-index: 1;
        display: grid;
        place-items: center;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--ch-red);
        color: #fff;
        box-shadow: 0 0 0 3px rgba(255, 69, 58, 0.3);
        --mdc-icon-size: 16px;
      }
      .offline {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 12px;
        color: var(--ch-text-secondary);
      }
    `]}customElements.define("camera-hub-tile-rail",ii);function si(e){return e.map((t)=>({day:t.day,hours:t.hours.map((i)=>Number.parseInt(i.hour,10)).sort((i,s)=>i-s)})).sort((t,i)=>t.day<i.day?1:-1)}function F(e,t=0){let[i,s,r]=e.split("-").map(Number);return new Date(i,s-1,r,t).getTime()/1000}function D(e){let t=new Date(e*1000),i=(s)=>String(s).padStart(2,"0");return`${t.getFullYear()}-${i(t.getMonth()+1)}-${i(t.getDate())}`}function ri(e){let t=e.flatMap((s)=>s.hours.map((r)=>F(s.day,r))).sort((s,r)=>s-r),i=[];for(let s of t){let r=i.at(-1);if(r&&s<=r[1])r[1]=Math.max(r[1],s+3600);else i.push([s,s+3600])}return i.reverse()}function K(e,t){return(e.top-t)/3600*e.pixelsPerHour}function Z(e,t){return e.top-t/e.pixelsPerHour*3600}function ni(e,t){let i=[],s=new Date(e*1000);s.setMinutes(0,0,0);for(let r=s.getTime()/1000;r>=t;r-=3600)i.push(r);return i}var J=28,Qe=[30,60,120,240,480],ps=120,hs=250,us=20,Te=800,Pe=48,ai=14;class oi extends v{static properties={hass:{attribute:!1},camera:{attribute:!1},position:{attribute:!1},days:{state:!0},reviews:{state:!0},pixelsPerHour:{state:!0},now:{state:!0},view:{state:!0},dragTime:{state:!0},visibleDay:{state:!0}};constructor(){super();this.loadingDays=new Set;this.browsing=!1;this.ignoreScroll=!1;this.lastScrub=0;this.position=null,this.days=[],this.reviews=new Map,this.pixelsPerHour=ps,this.now=Date.now()/1000,this.view=[0,2000],this.dragTime=null,this.visibleDay=D(this.now)}get viewport(){return this.renderRoot.querySelector(".viewport")}get scale(){return{top:this.now,pixelsPerHour:this.pixelsPerHour}}get oldest(){let e=this.days.at(-1);return e?F(e.day):this.now-86400}y(e){return J+K(this.scale,e)}timeAtY(e){return Math.min(this.now,Math.max(this.oldest,Z(this.scale,e-J)))}connectedCallback(){super.connectedCallback(),this.clockTimer=setInterval(()=>this.now=Date.now()/1000,30000)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.clockTimer)}willUpdate(e){let t=e.get("camera");if(e.has("camera")&&t?.entity_id!==this.camera?.entity_id)this.days=[],this.reviews=new Map,this.loadingDays.clear(),this.browsing=!1,this.loadSummary()}updated(e){if(e.has("position")||e.has("days")||e.has("pixelsPerHour"))this.follow();if(e.has("view")||e.has("days"))this.loadVisibleReviews()}firstUpdated(){this.updateView()}async loadSummary(){let e=this.camera;try{let t=si(await Pt(this.hass,e.instance_id,e.frigate_name));if(e===this.camera)this.days=t}catch{this.days=[]}}loadVisibleReviews(){let e=this.camera;if(!e)return;let t=Z(this.scale,Math.max(0,this.view[0]-J)),i=Z(this.scale,this.view[1]);for(let s=t;s>=i-86400;s-=86400){let r=D(s);if(this.reviews.has(r)||this.loadingDays.has(r))continue;this.loadingDays.add(r);let n=F(r);Ct(this.hass,e.instance_id,e.frigate_name,n,n+86400).then((a)=>{if(e!==this.camera)return;this.reviews=new Map(this.reviews).set(r,a)},()=>this.loadingDays.delete(r))}}scrollToY(e){let t=this.viewport;if(!t)return;this.ignoreScroll=!0,t.scrollTop=Math.max(0,e),requestAnimationFrame(()=>this.ignoreScroll=!1),this.updateView()}follow(){let e=this.viewport;if(!e||this.browsing||this.dragTime!==null)return;let t=this.y(this.position??this.now),i=e.scrollTop,s=i+e.clientHeight;if(t>=i+Pe&&t<=s-Pe)return;this.scrollToY(t-e.clientHeight/3)}updateView(){let e=this.viewport;if(!e)return;let t=e.scrollTop-Te,i=e.scrollTop+e.clientHeight+Te;if(Math.abs(t-this.view[0])>Te/2||Math.abs(i-this.view[1])>Te/2)this.view=[t,i];let s=D(this.timeAtY(e.scrollTop+J));if(s!==this.visibleDay)this.visibleDay=s}onScroll(){if(this.updateView(),!this.ignoreScroll&&this.dragTime===null)this.browsing=!0}seek(e){this.browsing=!1;let t=e>=Date.now()/1000-us;this.dispatchEvent(new CustomEvent("timeline-seek",{detail:t?null:e,bubbles:!0,composed:!0}))}contentY(e){let t=this.renderRoot.querySelector(".content");return e.clientY-t.getBoundingClientRect().top}onTap(e){this.seek(this.timeAtY(this.contentY(e)))}onMarkTap(e,t){e.stopPropagation(),this.seek(Math.max(this.oldest,t.start_time-2))}onDragStart(e){e.preventDefault(),e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),this.browsing=!1,this.dragTime=this.timeAtY(this.contentY(e))}onDragMove(e){if(this.dragTime===null)return;let t=this.viewport,i=t.getBoundingClientRect();if(e.clientY<i.top+Pe)t.scrollTop-=ai;else if(e.clientY>i.bottom-Pe)t.scrollTop+=ai;let s=this.timeAtY(this.contentY(e));if(this.dragTime=s,Date.now()-this.lastScrub<hs)return;this.lastScrub=Date.now(),this.dispatchEvent(new CustomEvent("timeline-scrub",{detail:s,bubbles:!0,composed:!0}))}onDragEnd(){let e=this.dragTime;if(e===null)return;this.dragTime=null,this.seek(e)}showDay(e){let t=e.hours.length?F(e.day,e.hours.at(-1)+1):F(e.day)+86399;this.browsing=!0,this.scrollToY(this.y(Math.min(t,this.now))-J)}zoom(e){let t=Qe.indexOf(this.pixelsPerHour),i=Qe[Math.min(Qe.length-1,Math.max(0,t+e))];if(i===this.pixelsPerHour)return;let s=this.viewport;if(!s)return;let r=s.clientHeight/2,n=this.timeAtY(s.scrollTop+r);this.pixelsPerHour=i,this.updateComplete.then(()=>this.scrollToY(this.y(n)-r))}dayLabel(e){if(e===D(this.now))return"Today";if(e===D(this.now-86400))return"Yesterday";return new Date(F(e)*1000).toLocaleDateString([],{weekday:"short",month:"short",day:"numeric"})}clock(e,t=!1){return new Date(e*1000).toLocaleTimeString([],{hour:"numeric",minute:"2-digit",...t?{second:"2-digit"}:{}})}render(){let e=this.scale,[t,i]=this.view,s=Z(e,Math.max(0,t-J)),r=Z(e,i),n=(c)=>this.y(c),a=n(this.oldest)+600,l=this.dragTime??this.position,p=l===null,m=n(l??this.now),h=ri(this.days).filter(([c,y])=>y>=r&&c<=s),u=ni(Math.min(s,this.now),Math.max(r,this.oldest)),g=[...this.reviews.values()].flat().filter((c)=>(c.end_time??this.now)>=r&&c.start_time<=s);return o`
      <div class="bar">
        <div class="days">
          ${this.days.map((c)=>o`<button
              class="day ${c.day===this.visibleDay?"on":""}"
              @click=${()=>this.showDay(c)}
            >
              ${this.dayLabel(c.day)}
            </button>`)}
        </div>
        <div class="zoom">
          <button aria-label="Zoom out" @click=${()=>this.zoom(-1)}>
            <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
          </button>
          <button aria-label="Zoom in" @click=${()=>this.zoom(1)}>
            <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
          </button>
        </div>
      </div>
      <div class="box">
        <div class="viewport" @scroll=${this.onScroll}>
          <div class="content" style="height: ${a}px" @click=${this.onTap}>
            <div class="now" style="top: ${n(this.now)}px"><span>Now</span></div>
            ${h.map(([c,y])=>o`<div
                  class="recorded"
                  style="top: ${n(Math.min(y,this.now))}px; height: ${K(e,c)-K(e,Math.min(y,this.now))}px"
                ></div>`)}
            ${u.map((c)=>{let y=new Date(c*1000).getHours()===0;return o`<div class="hour ${y?"midnight":""}" style="top: ${n(c)}px">
                <span>${y?this.dayLabel(D(c)):this.clock(c)}</span>
              </div>`})}
            ${g.map((c)=>{let y=c.end_time??this.now,de=n(y),T=Math.max(6,K(e,c.start_time)-K(e,y));return o`<button
                class="mark ${c.severity}"
                style="top: ${de}px; height: ${T}px"
                title=${`${H(c)} · ${this.clock(c.start_time)}`}
                @click=${(P)=>this.onMarkTap(P,c)}
              ></button>`})}
            <div
              class="playhead ${this.dragTime!==null?"dragging":""}"
              style="top: ${m}px"
              @pointerdown=${this.onDragStart}
              @pointermove=${this.onDragMove}
              @pointerup=${this.onDragEnd}
              @pointercancel=${this.onDragEnd}
              @click=${(c)=>c.stopPropagation()}
            >
              <div class="line"></div>
              <span class="pill ${p?"live":""}">
                <ha-icon icon="mdi:drag-vertical"></ha-icon>
                ${p?"Live":`${this.dayLabel(D(l))} · ${this.clock(l,!0)}`}
              </span>
            </div>
          </div>
        </div>
        ${this.days.length===0?o`<div class="empty">Loading recordings…</div>`:d}
      </div>
    `}static styles=[w,b`
      :host {
        display: flex;
        flex-direction: column;
        gap: 10px;
        height: var(--ch-timeline-height, 560px);
        min-height: 280px;
      }
      .bar {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .days {
        flex: 1;
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .day,
      .zoom button {
        flex: none;
        min-height: 40px;
        padding: 0 12px;
        border: 1px solid var(--ch-hairline);
        border-radius: 999px;
        background: var(--ch-surface);
        color: var(--ch-text-secondary);
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        touch-action: manipulation;
      }
      .day.on {
        background: var(--ch-accent);
        border-color: var(--ch-accent);
        color: #fff;
      }
      .zoom {
        display: flex;
        gap: 6px;
      }
      .zoom button {
        display: grid;
        place-items: center;
        width: 40px;
        padding: 0;
        --mdc-icon-size: 20px;
      }
      .box {
        position: relative;
        flex: 1;
        min-height: 0;
        border-radius: var(--ch-radius-tile);
        background: var(--ch-surface);
        overflow: hidden;
      }
      .viewport {
        position: absolute;
        inset: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: none;
      }
      .content {
        position: relative;
      }
      .recorded {
        position: absolute;
        left: 72px;
        right: 12px;
        background: rgba(76, 141, 255, 0.12);
        border-radius: 4px;
      }
      .hour {
        position: absolute;
        left: 0;
        right: 0;
        height: 0;
        border-top: 1px solid var(--ch-hairline);
      }
      .hour span {
        position: absolute;
        top: -9px;
        left: 10px;
        font-size: 12px;
        color: var(--ch-text-secondary);
        font-variant-numeric: tabular-nums;
        background: var(--ch-surface);
        padding-right: 6px;
      }
      .hour.midnight {
        border-top-color: rgba(255, 255, 255, 0.3);
      }
      .hour.midnight span {
        font-weight: 700;
        color: var(--ch-text);
      }
      .mark {
        position: absolute;
        right: 20px;
        width: 26px;
        padding: 0;
        border: 0;
        border-radius: 4px;
        cursor: pointer;
      }
      .mark.alert {
        background: var(--ch-amber);
      }
      .mark.detection {
        right: 50px;
        width: 14px;
        background: rgba(255, 176, 32, 0.45);
      }
      .now {
        position: absolute;
        left: 0;
        right: 0;
        height: 0;
        border-top: 1px dashed rgba(255, 255, 255, 0.35);
      }
      .now span {
        position: absolute;
        top: -9px;
        left: 10px;
        font-size: 12px;
        font-weight: 700;
        color: var(--ch-text);
        background: var(--ch-surface);
        padding-right: 6px;
      }
      /* The play line. Its grab area is taller than the line and stops the
         drag from scrolling the timeline. */
      .playhead {
        position: absolute;
        left: 0;
        right: 0;
        height: 40px;
        margin-top: -20px;
        z-index: 2;
        cursor: grab;
        touch-action: none;
      }
      .playhead.dragging {
        cursor: grabbing;
      }
      .line {
        position: absolute;
        left: 0;
        right: 0;
        top: 19px;
        height: 2px;
        background: var(--ch-red);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
      }
      .pill {
        position: absolute;
        right: 8px;
        top: 6px;
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 4px 10px 4px 4px;
        border-radius: 999px;
        background: var(--ch-red);
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        --mdc-icon-size: 18px;
      }
      .playhead.dragging .pill {
        transform: scale(1.08);
      }
      .empty {
        position: absolute;
        inset: auto 0 16px 0;
        text-align: center;
        font-size: 13px;
        color: var(--ch-text-secondary);
      }
    `]}customElements.define("camera-hub-vertical-timeline",oi);var ms=1e4,fs=700,gs=120000;function vs(e){let t=`camera-hub-reloaded-for-${e}`;try{if(sessionStorage.getItem(t))return console.warn(`Camera Hub: the card is 0.7.1, the integration is ${e}.`),!1;sessionStorage.setItem(t,"1")}catch{return!1}return location.reload(),!0}class li extends v{static properties={hass:{attribute:!1},load:{state:!0},selected:{state:!0},snapshotRefresh:{state:!0},openClip:{state:!0},reviewsRevision:{state:!0},shift:{state:!0},phone:{state:!0},tab:{state:!0},timelineOpen:{state:!0},playbackPosition:{state:!0}};constructor(){super();this.cardConfig={type:"custom:camera-hub-card"};this.loadStarted=!1;this.idle=new We(()=>this.selectDefault());this.reviewStore=new Xe;this.resizeObserver=new ResizeObserver(([e])=>{this.phone=e.contentRect.width<fs});this.onVisibilityChange=()=>{if(clearInterval(this.snapshotTimer),!document.hidden)this.refreshSnapshots()};this.load={state:"loading"},this.snapshotRefresh=Date.now(),this.reviewsRevision=0,this.shift=[0,0],this.phone=!1,this.tab="cameras",this.timelineOpen=!1,this.playbackPosition=null,this.reviewStore.onChange(()=>this.reviewsRevision++),this.addEventListener("pointerdown",()=>this.idle.restart(),{capture:!0}),this.addEventListener("camera-select",(e)=>{this.selected=e.detail}),this.addEventListener("clip-open",(e)=>this.onClipOpen(e.detail)),this.addEventListener("clip-close",()=>this.openClip=void 0),this.addEventListener("timeline-toggle",()=>{if(this.phone)this.tab=this.tab==="timeline"?"cameras":"timeline";else this.timelineOpen=!this.timelineOpen}),this.addEventListener("playback-position",(e)=>{this.playbackPosition=e.detail}),this.addEventListener("timeline-seek",(e)=>{let t=e.detail,i=this.renderRoot.querySelector("camera-hub-main-view");if(t===null)i?.goLive();else i?.playRecording(t)}),this.addEventListener("timeline-scrub",(e)=>{this.renderRoot.querySelector("camera-hub-main-view")?.previewRecording(e.detail)})}setConfig(e){this.cardConfig=e}getCardSize(){return 8}connectedCallback(){if(super.connectedCallback(),document.addEventListener("visibilitychange",this.onVisibilityChange),this.resizeObserver.observe(this),this.refreshSnapshots(),this.load.state==="ready")this.idle.restart();this.shiftTimer=setInterval(()=>{let e=()=>Math.round(Math.random()*4)-2;this.shift=[e(),e()]},gs)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("visibilitychange",this.onVisibilityChange),clearInterval(this.snapshotTimer),clearInterval(this.shiftTimer),this.resizeObserver.disconnect(),this.idle.stop(),this.reviewStore.stop(),this.loadStarted=!1}refreshSnapshots(){this.snapshotRefresh=Date.now(),clearInterval(this.snapshotTimer),this.snapshotTimer=setInterval(()=>this.snapshotRefresh=Date.now(),ms)}updated(){if(this.hass&&!this.loadStarted)this.loadStarted=!0,this.loadConfig()}async loadConfig(){try{let e=await $t(this.hass);if(e.version!=="0.7.1"&&vs(e.version))return;this.load={state:"ready",config:e};let t=e.cameras[0]?.instance_id;if(t)this.reviewStore.start(this.hass,t,e.cameras.map((i)=>i.frigate_name));this.selectDefault(),this.idle.setTimeout(e.return_after_seconds)}catch(e){let t=x(e);this.load={state:"error",message:t}}}defaultCamera(e){let t=this.cardConfig.main_camera??e.default_camera;return e.cameras.find((i)=>i.entity_id===t)??e.cameras[0]}async onClipOpen(e){let t=this.cameraByFrigateName(e.camera);if(e.end_time===null||this.phone&&t){if(t)this.selected=t.entity_id;if(e.end_time===null||!t)return;await this.updateComplete;let i=this.renderRoot.querySelector("camera-hub-main-view");await i?.updateComplete,i?.playRecording(e.start_time-2);return}this.openClip=e}cameraByFrigateName(e){if(this.load.state!=="ready")return;return this.load.config.cameras.find((t)=>t.frigate_name===e)}selectDefault(){if(this.load.state==="ready")this.selected=this.defaultCamera(this.load.config)?.entity_id}render(){if(this.load.state==="loading")return o`<div class="notice">Loading cameras…</div>`;if(this.load.state==="error")return o`<div class="notice">Camera Hub is not available: ${this.load.message}</div>`;let{cameras:e,doorbell:t}=this.load.config,i=t?.camera&&t.active_entity?this.hass.states[t.active_entity]?.state==="on":!1,s=e.find((u)=>u.entity_id===this.selected),r=new Set(this.reviewStore.reviews.filter((u)=>u.end_time===null).map((u)=>u.camera)),n=o`<camera-hub-main-view
      .hass=${this.hass}
      .camera=${s}
      .snapshotRefresh=${this.snapshotRefresh}
      .timelineOpen=${this.phone?this.tab==="timeline":this.timelineOpen}
    ></camera-hub-main-view>`,a=o`<camera-hub-tile-rail
      .hass=${this.hass}
      .cameras=${e}
      .selected=${this.selected}
      .refresh=${this.snapshotRefresh}
      .alerting=${r}
    ></camera-hub-tile-rail>`,l=s?o`<camera-hub-vertical-timeline
          .hass=${this.hass}
          .camera=${s}
          .position=${this.playbackPosition}
        ></camera-hub-vertical-timeline>`:d,p=this.phone?"list":"row",m=o`<camera-hub-pause-bar
      .hass=${this.hass}
      .zones=${this.load.config.zones??[]}
      .layout=${p}
    ></camera-hub-pause-bar>`,h=o`<camera-hub-clips-strip
      .hass=${this.hass}
      .cameras=${e}
      .store=${this.reviewStore}
      .layout=${p}
    ></camera-hub-clips-strip>`;return o`
      ${this.phone?this.renderPhone(n,a,h,l,m,r.size>0):o`<div class="layout" style="translate: ${this.shift[0]}px ${this.shift[1]}px">
            ${n}
            ${this.timelineOpen?o`<div class="side-timeline">
                  <div class="side-head">
                    <span>Timeline · ${s?.name??""}</span>
                    <button @click=${()=>this.timelineOpen=!1}>
                      <ha-icon icon="mdi:view-grid-outline"></ha-icon>Cameras
                    </button>
                  </div>
                  ${l}
                </div>`:a}
            ${m}${h}
          </div>`}
      ${this.openClip?o`<camera-hub-clip-modal
            .hass=${this.hass}
            .review=${this.openClip}
            .instanceId=${e[0]?.instance_id??""}
            .cameraName=${this.cameraByFrigateName(this.openClip.camera)?.name??this.openClip.camera}
          ></camera-hub-clip-modal>`:d}
      ${i&&t?.camera&&t.active_entity?o`<camera-hub-doorbell-overlay
            .hass=${this.hass}
            .camera=${t.camera}
            .activeEntity=${t.active_entity}
          ></camera-hub-doorbell-overlay>`:d}
    `}renderPhone(e,t,i,s,r,n){let a=this.load.state==="ready"?this.load.config.zones??[]:[],l=a.some((h)=>h.notify&&h.switch_entity&&this.hass.states[h.switch_entity]?.state==="off"),p=a.some((h)=>h.notify),m=[{id:"cameras",label:"Cameras"},{id:"alerts",label:"Alerts",dot:n?"red":void 0},{id:"timeline",label:"Timeline"},...p?[{id:"pause",label:"Pause",dot:l?"amber":void 0}]:[]];return o`
      <div class="phone">
        <div class="sticky">${e}</div>
        <div class="tabs" role="tablist">
          ${m.map((h)=>o`<button
              role="tab"
              aria-selected=${this.tab===h.id}
              class="tab ${this.tab===h.id?"on":""}"
              @click=${()=>this.tab=h.id}
            >
              ${h.label}${h.dot?o`<span class="tab-dot ${h.dot}"></span>`:d}
            </button>`)}
        </div>
        <div class="panel">
          ${this.tab==="alerts"?i:this.tab==="timeline"?s:this.tab==="pause"&&p?r:t}
        </div>
      </div>
    `}static styles=[w,b`
      :host {
        display: block;
        container-type: inline-size;
        background: var(--ch-bg);
        border-radius: var(--ch-radius-main);
        padding: var(--ch-gap);
      }
      .layout {
        transition: translate 2s ease;
        display: grid;
        gap: calc(var(--ch-gap) * 1.5) var(--ch-gap);
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas: "main" "pause" "clips" "rail";
        --ch-rail-columns: 3;
      }
      camera-hub-main-view {
        grid-area: main;
      }
      camera-hub-clips-strip {
        grid-area: clips;
      }
      camera-hub-pause-bar {
        grid-area: pause;
        min-width: 0;
      }
      camera-hub-tile-rail,
      .side-timeline {
        grid-area: rail;
      }
      .side-timeline {
        display: flex;
        flex-direction: column;
        gap: 10px;
        --ch-timeline-height: 600px;
      }
      .side-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 600;
        color: var(--ch-text-secondary);
      }
      .side-head button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 40px;
        padding: 0 12px;
        border: 1px solid var(--ch-hairline);
        border-radius: 999px;
        background: var(--ch-surface);
        color: var(--ch-text);
        font: inherit;
        font-size: 13px;
        cursor: pointer;
        --mdc-icon-size: 18px;
      }
      /* Tablet and desktop: the tiles sit in a column next to the main view,
         and the alerts run under the main view. */
      @container (min-width: 900px) {
        .layout {
          grid-template-columns: minmax(0, 1fr) clamp(280px, 30%, 420px);
          grid-template-areas: "main rail" "pause rail" "clips rail";
          grid-template-rows: auto auto 1fr;
          align-items: start;
          --ch-rail-columns: 2;
        }
      }
      /* Phone: the video stays at the top while the tab below it scrolls. */
      .phone {
        --ch-rail-columns: 2;
        /* The timeline fills the screen under the video and the tabs. */
        --ch-timeline-height: max(320px, calc(100dvh - var(--header-height, 56px) - 400px));
      }
      .sticky {
        position: sticky;
        top: var(--header-height, 56px);
        z-index: 2;
        margin: calc(var(--ch-gap) * -1) calc(var(--ch-gap) * -1) 0;
        padding: var(--ch-gap) var(--ch-gap) 0;
        background: var(--ch-bg);
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin: 12px 0;
        padding: 4px;
        border-radius: 999px;
        background: var(--ch-surface);
      }
      .tab {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 44px;
        border: 0;
        border-radius: 999px;
        background: none;
        color: var(--ch-text-secondary);
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        touch-action: manipulation;
      }
      .tab.on {
        background: var(--ch-surface-raised);
        color: var(--ch-text);
      }
      .tab-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .tab-dot.red {
        background: var(--ch-red);
      }
      .tab-dot.amber {
        background: var(--ch-amber);
      }
      .notice {
        padding: 24px;
        color: var(--ch-text-secondary);
      }
    `]}customElements.define("camera-hub-card",li);var ci=window;ci.customCards??=[];ci.customCards.push({type:"camera-hub-card",name:"Camera Hub",description:"Live cameras, clips and alerts from Frigate."});console.info("Camera Hub card 0.7.1");export{li as CameraHubCard};
