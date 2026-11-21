var K=globalThis,ne=K.ShadowRoot&&(K.ShadyCSS===void 0||K.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,oe=Symbol(),$e=new WeakMap;class ae{constructor(e,t,i){if(this._$cssResult$=!0,i!==oe)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this._strings=t}get styleSheet(){let e=this._styleSheet,t=this._strings;if(ne&&e===void 0){let i=t!==void 0&&t.length===1;if(i)e=$e.get(t);if(e===void 0){if((this._styleSheet=e=new CSSStyleSheet).replaceSync(this.cssText),i)$e.set(t,e)}}return e}toString(){return this.cssText}}var gt=(e)=>{if(e._$cssResult$===!0)return e.cssText;else if(typeof e==="number")return e;else throw Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)},yt=(e)=>new ae(typeof e==="string"?e:String(e),void 0,oe),x=(e,...t)=>{let i=e.length===1?e[0]:t.reduce((s,r,o)=>s+gt(r)+e[o+1],e[0]);return new ae(i,e,oe)},Ce=(e,t)=>{if(ne)e.adoptedStyleSheets=t.map((i)=>i instanceof CSSStyleSheet?i:i.styleSheet);else for(let i of t){let s=document.createElement("style"),r=K.litNonce;if(r!==void 0)s.setAttribute("nonce",r);s.textContent=i.cssText,e.appendChild(s)}},bt=(e)=>{let t="";for(let i of e.cssRules)t+=i.cssText;return yt(t)},ce=ne?(e)=>e:(e)=>e instanceof CSSStyleSheet?bt(e):e;var{is:_t,defineProperty:vt,getOwnPropertyDescriptor:Te,getOwnPropertyNames:wt,getOwnPropertySymbols:St,getPrototypeOf:Pe}=Object,xt=!1,b=globalThis;if(xt)b.customElements??=customElements;var _=!0,E,Re=b.trustedTypes,Et=Re?Re.emptyScript:"",ke=_?b.reactiveElementPolyfillSupportDevMode:b.reactiveElementPolyfillSupport;if(_)b.litIssuedWarnings??=new Set,E=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!b.litIssuedWarnings.has(t)&&!b.litIssuedWarnings.has(e))console.warn(t),b.litIssuedWarnings.add(t)},queueMicrotask(()=>{if(E("dev-mode","Lit is in dev mode. Not recommended for production!"),b.ShadyDOM?.inUse&&ke===void 0)E("polyfill-support-missing","Shadow DOM is being polyfilled via `ShadyDOM` but the `polyfill-support` module has not been loaded.")});var $t=_?(e)=>{if(!b.emitLitDebugLogEvents)return;b.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))}:void 0,H=(e,t)=>e,de={toAttribute(e,t){switch(t){case Boolean:e=e?Et:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e);break}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=e!==null;break;case Number:i=e===null?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(s){i=null}break}return i}},Me=(e,t)=>!_t(e,t),Ae={attribute:!0,type:String,converter:de,reflect:!1,useDefault:!1,hasChanged:Me};Symbol.metadata??=Symbol("metadata");b.litPropertyMetadata??=new WeakMap;class v extends HTMLElement{static addInitializer(e){this.__prepare(),(this._initializers??=[]).push(e)}static get observedAttributes(){return this.finalize(),this.__attributeToPropertyMap&&[...this.__attributeToPropertyMap.keys()]}static createProperty(e,t=Ae){if(t.state)t.attribute=!1;if(this.__prepare(),this.prototype.hasOwnProperty(e))t=Object.create(t),t.wrapped=!0;if(this.elementProperties.set(e,t),!t.noAccessor){let i=_?Symbol.for(`${String(e)} (@property() cache)`):Symbol(),s=this.getPropertyDescriptor(e,i,t);if(s!==void 0)vt(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){let{get:s,set:r}=Te(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};if(_&&s==null){if("value"in(Te(this.prototype,e)??{}))throw Error(`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it's actually declared as a value on the prototype. Usually this is due to using @property or @state on a method.`);E("reactive-property-without-getter",`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it does not have a getter. This will be an error in a future version of Lit.`)}return{get:s,set(o){let n=s?.call(this);r?.call(this,o),this.requestUpdate(e,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ae}static __prepare(){if(this.hasOwnProperty(H("elementProperties",this)))return;let e=Pe(this);if(e.finalize(),e._initializers!==void 0)this._initializers=[...e._initializers];this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(H("finalized",this)))return;if(this.finalized=!0,this.__prepare(),this.hasOwnProperty(H("properties",this))){let t=this.properties,i=[...wt(t),...St(t)];for(let s of i)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,s]of t)this.elementProperties.set(i,s)}this.__attributeToPropertyMap=new Map;for(let[t,i]of this.elementProperties){let s=this.__attributeNameForProperty(t,i);if(s!==void 0)this.__attributeToPropertyMap.set(s,t)}if(this.elementStyles=this.finalizeStyles(this.styles),_){if(this.hasOwnProperty("createProperty"))E("no-override-create-property","Overriding ReactiveElement.createProperty() is deprecated. The override will not be called with standard decorators");if(this.hasOwnProperty("getPropertyDescriptor"))E("no-override-get-property-descriptor","Overriding ReactiveElement.getPropertyDescriptor() is deprecated. The override will not be called with standard decorators")}}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let s of i)t.unshift(ce(s))}else if(e!==void 0)t.push(ce(e));return t}static __attributeNameForProperty(e,t){let i=t.attribute;return i===!1?void 0:typeof i==="string"?i:typeof e==="string"?e.toLowerCase():void 0}constructor(){super();this.__instanceProperties=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.__reflectingProperty=null,this.__initialize()}__initialize(){this.__updatePromise=new Promise((e)=>this.enableUpdating=e),this._$changedProperties=new Map,this.__saveInstanceProperties(),this.requestUpdate(),this.constructor._initializers?.forEach((e)=>e(this))}addController(e){if((this.__controllers??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected)e.hostConnected?.()}removeController(e){this.__controllers?.delete(e)}__saveInstanceProperties(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())if(this.hasOwnProperty(i))e.set(i,this[i]),delete this[i];if(e.size>0)this.__instanceProperties=e}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ce(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this.__controllers?.forEach((e)=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this.__controllers?.forEach((e)=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$attributeToProperty(e,i)}__propertyToAttribute(e,t){let s=this.constructor.elementProperties.get(e),r=this.constructor.__attributeNameForProperty(e,s);if(r!==void 0&&s.reflect===!0){let n=(s.converter?.toAttribute!==void 0?s.converter:de).toAttribute(t,s.type);if(_&&this.constructor.enabledWarnings.includes("migration")&&n===void 0)E("undefined-attribute-value",`The attribute value for the ${e} property is undefined on element ${this.localName}. The attribute will be removed, but in the previous version of \`ReactiveElement\`, the attribute would not have changed.`);if(this.__reflectingProperty=e,n==null)this.removeAttribute(r);else this.setAttribute(r,n);this.__reflectingProperty=null}}_$attributeToProperty(e,t){let i=this.constructor,s=i.__attributeToPropertyMap.get(e);if(s!==void 0&&this.__reflectingProperty!==s){let r=i.getPropertyOptions(s),o=typeof r.converter==="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:de;this.__reflectingProperty=s;let n=o.fromAttribute(t,r.type);this[s]=n??this.__defaultValues?.get(s)??n,this.__reflectingProperty=null}}requestUpdate(e,t,i,s=!1,r){if(e!==void 0){if(_&&e instanceof Event)E("","The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()");let o=this.constructor;if(s===!1)r=this[e];if(i??=o.getPropertyOptions(e),(i.hasChanged??Me)(r,t)||i.useDefault&&i.reflect&&r===this.__defaultValues?.get(e)&&!this.hasAttribute(o.__attributeNameForProperty(e,i)))this._$changeProperty(e,t,i);else return}if(this.isUpdatePending===!1)this.__updatePromise=this.__enqueueUpdate()}_$changeProperty(e,t,{useDefault:i,reflect:s,wrapped:r},o){if(i&&!(this.__defaultValues??=new Map).has(e)){if(this.__defaultValues.set(e,o??t??this[e]),r!==!0||o!==void 0)return}if(!this._$changedProperties.has(e)){if(!this.hasUpdated&&!i)t=void 0;this._$changedProperties.set(e,t)}if(s===!0&&this.__reflectingProperty!==e)(this.__reflectingProperties??=new Set).add(e)}async __enqueueUpdate(){this.isUpdatePending=!0;try{await this.__updatePromise}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();if(e!=null)await e;return!this.isUpdatePending}scheduleUpdate(){let e=this.performUpdate();if(_&&this.constructor.enabledWarnings.includes("async-perform-update")&&typeof e?.then==="function")E("async-perform-update",`Element ${this.localName} returned a Promise from performUpdate(). This behavior is deprecated and will be removed in a future version of ReactiveElement.`);return e}performUpdate(){if(!this.isUpdatePending)return;if($t?.({kind:"update"}),!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),_){let r=[...this.constructor.elementProperties.keys()].filter((o)=>this.hasOwnProperty(o)&&(o in Pe(this)));if(r.length)throw Error(`The following properties on element ${this.localName} will not trigger updates as expected because they are set using class fields: ${r.join(", ")}. Native class fields and some compiled output will overwrite accessors used for detecting changes. See https://lit.dev/msg/class-field-shadowing for more information.`)}if(this.__instanceProperties){for(let[s,r]of this.__instanceProperties)this[s]=r;this.__instanceProperties=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,r]of i){let{wrapped:o}=r,n=this[s];if(o===!0&&!this._$changedProperties.has(s)&&n!==void 0)this._$changeProperty(s,void 0,r,n)}}let e=!1,t=this._$changedProperties;try{if(e=this.shouldUpdate(t),e)this.willUpdate(t),this.__controllers?.forEach((i)=>i.hostUpdate?.()),this.update(t);else this.__markUpdated()}catch(i){throw e=!1,this.__markUpdated(),i}if(e)this._$didUpdate(t)}willUpdate(e){}_$didUpdate(e){if(this.__controllers?.forEach((t)=>t.hostUpdated?.()),!this.hasUpdated)this.hasUpdated=!0,this.firstUpdated(e);if(this.updated(e),_&&this.isUpdatePending&&this.constructor.enabledWarnings.includes("change-in-update"))E("change-in-update",`Element ${this.localName} scheduled an update (generally because a property was set) after an update completed, causing a new update to be scheduled. This is inefficient and should be avoided unless the next update can only be scheduled as a side effect of the previous update.`)}__markUpdated(){this._$changedProperties=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.__updatePromise}shouldUpdate(e){return!0}update(e){this.__reflectingProperties&&=this.__reflectingProperties.forEach((t)=>this.__propertyToAttribute(t,this[t])),this.__markUpdated()}updated(e){}firstUpdated(e){}}v.elementStyles=[];v.shadowRootOptions={mode:"open"};v[H("elementProperties",v)]=new Map;v[H("finalized",v)]=new Map;ke?.({ReactiveElement:v});if(_){v.enabledWarnings=["change-in-update","async-perform-update"];let e=function(t){if(!t.hasOwnProperty(H("enabledWarnings",t)))t.enabledWarnings=t.enabledWarnings.slice()};v.enableWarning=function(t){if(e(this),!this.enabledWarnings.includes(t))this.enabledWarnings.push(t)},v.disableWarning=function(t){e(this);let i=this.enabledWarnings.indexOf(t);if(i>=0)this.enabledWarnings.splice(i,1)}}(b.reactiveElementVersions??=[]).push("2.1.2");if(_&&b.reactiveElementVersions.length>1)queueMicrotask(()=>{E("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var w=globalThis,l=(e)=>{if(!w.emitLitDebugLogEvents)return;w.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))},Ct=0,z;w.litIssuedWarnings??=new Set,z=(e,t)=>{if(t+=e?` See https://lit.dev/msg/${e} for more information.`:"",!w.litIssuedWarnings.has(t)&&!w.litIssuedWarnings.has(e))console.warn(t),w.litIssuedWarnings.add(t)},queueMicrotask(()=>{z("dev-mode","Lit is in dev mode. Not recommended for production!")});var C=w.ShadyDOM?.inUse&&w.ShadyDOM?.noPatch===!0?w.ShadyDOM.wrap:(e)=>e,X=w.trustedTypes,Oe=X?X.createPolicy("lit-html",{createHTML:(e)=>e}):void 0,Tt=(e)=>e,Z=(e,t,i)=>Tt,Pt=(e)=>{if(I!==Z)throw Error("Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.");I=e},Rt=()=>{I=Z},me=(e,t,i)=>I(e,t,i),Ue="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,ze="?"+A,At=`<${ze}>`,N=document,W=()=>N.createComment(""),B=(e)=>e===null||typeof e!="object"&&typeof e!="function",fe=Array.isArray,kt=(e)=>fe(e)||typeof e?.[Symbol.iterator]==="function",le=`[ 	
\f\r]`,Mt=`[^ 	
\f\r"'\`<>=]`,Ot=`[^\\s"'>=/]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ne=1,pe=2,Nt=3,De=/-->/g,Ie=/>/g,M=new RegExp(`>|${le}(?:(${Ot}+)(${le}*=${le}*(?:${Mt}|("|')|))|$)`,"g"),Dt=0,He=1,It=2,Ve=3,he=/'/g,ue=/"/g,We=/^(?:script|style|textarea|title)$/i,Ht=1,J=2,Q=3,ge=1,G=2,Vt=3,Lt=4,Ut=5,ye=6,zt=7,be=(e)=>(t,...i)=>{if(t.some((s)=>s===void 0))console.warn(`Some template strings are undefined.
This is probably caused by illegal octal escape sequences.`);if(i.some((s)=>s?._$litStatic$))z("",`Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.
Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`);return{["_$litType$"]:e,strings:t,values:i}},u=be(Ht),pi=be(J),hi=be(Q),D=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),Le=new WeakMap,O=N.createTreeWalker(N,129),I=Z;function Be(e,t){if(!fe(e)||!e.hasOwnProperty("raw")){let i="invalid template strings array";throw i=`
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
`),Error(i)}return Oe!==void 0?Oe.createHTML(t):t}var Wt=(e,t)=>{let i=e.length-1,s=[],r=t===J?"<svg>":t===Q?"<math>":"",o,n=L;for(let d=0;d<i;d++){let g=e[d],c=-1,f,h=0,m;while(h<g.length){if(n.lastIndex=h,m=n.exec(g),m===null)break;if(h=n.lastIndex,n===L){if(m[Ne]==="!--")n=De;else if(m[Ne]!==void 0)n=Ie;else if(m[pe]!==void 0){if(We.test(m[pe]))o=new RegExp(`</${m[pe]}`,"g");n=M}else if(m[Nt]!==void 0)throw Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions")}else if(n===M)if(m[Dt]===">")n=o??L,c=-1;else if(m[He]===void 0)c=-2;else c=n.lastIndex-m[It].length,f=m[He],n=m[Ve]===void 0?M:m[Ve]==='"'?ue:he;else if(n===ue||n===he)n=M;else if(n===De||n===Ie)n=L;else n=M,o=void 0}console.assert(c===-1||n===M||n===he||n===ue,"unexpected parse state B");let T=n===M&&e[d+1].startsWith("/>")?" ":"";r+=n===L?g+At:c>=0?(s.push(f),g.slice(0,c)+Ue+g.slice(c))+A+T:g+A+(c===-2?d:T)}let a=r+(e[i]||"<?>")+(t===J?"</svg>":t===Q?"</math>":"");return[Be(e,a),s]};class F{constructor({strings:e,["_$litType$"]:t},i){this.parts=[];let s,r=0,o=0,n=e.length-1,a=this.parts,[d,g]=Wt(e,t);if(this.el=F.createElement(d,i),O.currentNode=this.el.content,t===J||t===Q){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}while((s=O.nextNode())!==null&&a.length<n){if(s.nodeType===1){{let c=s.localName;if(/^(?:textarea|template)$/i.test(c)&&s.innerHTML.includes(A)){let f=`Expressions are not supported inside \`${c}\` elements. See https://lit.dev/msg/expression-in-${c} for more information.`;if(c==="template")throw Error(f);else z("",f)}}if(s.hasAttributes()){for(let c of s.getAttributeNames())if(c.endsWith(Ue)){let f=g[o++],m=s.getAttribute(c).split(A),T=/([.?@])?(.*)/.exec(f);a.push({type:ge,index:r,name:T[2],strings:m,ctor:T[1]==="."?je:T[1]==="?"?qe:T[1]==="@"?Ye:q}),s.removeAttribute(c)}else if(c.startsWith(A))a.push({type:ye,index:r}),s.removeAttribute(c)}if(We.test(s.tagName)){let c=s.textContent.split(A),f=c.length-1;if(f>0){s.textContent=X?X.emptyScript:"";for(let h=0;h<f;h++)s.append(c[h],W()),O.nextNode(),a.push({type:G,index:++r});s.append(c[f],W())}}}else if(s.nodeType===8)if(s.data===ze)a.push({type:G,index:r});else{let f=-1;while((f=s.data.indexOf(A,f+1))!==-1)a.push({type:zt,index:r}),f+=A.length-1}r++}if(g.length!==o)throw Error('Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=${true} ?disabled=${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: \n`'+e.join("${...}")+"`");l&&l({kind:"template prep",template:this,clonableTemplate:this.el,parts:this.parts,strings:e})}static createElement(e,t){let i=N.createElement("template");return i.innerHTML=e,i}}function V(e,t,i=e,s){if(t===D)return t;let r=s!==void 0?i.__directives?.[s]:i.__directive,o=B(t)?void 0:t._$litDirective$;if(r?.constructor!==o){if(r?._$notifyDirectiveConnectionChanged?.(!1),o===void 0)r=void 0;else r=new o(e),r._$initialize(e,i,s);if(s!==void 0)(i.__directives??=[])[s]=r;else i.__directive=r}if(r!==void 0)t=V(e,r._$resolve(e,t.values),r,s);return t}class Fe{constructor(e,t){this._$parts=[],this._$disconnectableChildren=void 0,this._$template=e,this._$parent=t}get parentNode(){return this._$parent.parentNode}get _$isConnected(){return this._$parent._$isConnected}_clone(e){let{el:{content:t},parts:i}=this._$template,s=(e?.creationScope??N).importNode(t,!0);O.currentNode=s;let r=O.nextNode(),o=0,n=0,a=i[0];while(a!==void 0){if(o===a.index){let d;if(a.type===G)d=new j(r,r.nextSibling,this,e);else if(a.type===ge)d=new a.ctor(r,a.name,a.strings,this,e);else if(a.type===ye)d=new Ke(r,this,e);this._$parts.push(d),a=i[++n]}if(o!==a?.index)r=O.nextNode(),o++}return O.currentNode=N,s}_update(e){let t=0;for(let i of this._$parts){if(i!==void 0)if(l&&l({kind:"set part",part:i,value:e[t],valueIndex:t,values:e,templateInstance:this}),i.strings!==void 0)i._$setValue(e,i,t),t+=i.strings.length-2;else i._$setValue(e[t]);t++}}}class j{get _$isConnected(){return this._$parent?._$isConnected??this.__isConnected}constructor(e,t,i,s){this.type=G,this._$committedValue=p,this._$disconnectableChildren=void 0,this._$startNode=e,this._$endNode=t,this._$parent=i,this.options=s,this.__isConnected=s?.isConnected??!0,this._textSanitizer=void 0}get parentNode(){let e=C(this._$startNode).parentNode,t=this._$parent;if(t!==void 0&&e?.nodeType===11)e=t.parentNode;return e}get startNode(){return this._$startNode}get endNode(){return this._$endNode}_$setValue(e,t=this){if(this.parentNode===null)throw Error("This `ChildPart` has no `parentNode` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's `innerHTML` or `textContent` can do this.");if(e=V(this,e,t),B(e)){if(e===p||e==null||e===""){if(this._$committedValue!==p)l&&l({kind:"commit nothing to child",start:this._$startNode,end:this._$endNode,parent:this._$parent,options:this.options}),this._$clear();this._$committedValue=p}else if(e!==this._$committedValue&&e!==D)this._commitText(e)}else if(e._$litType$!==void 0)this._commitTemplateResult(e);else if(e.nodeType!==void 0){if(this.options?.host===e){this._commitText("[probable mistake: rendered a template's host in itself (commonly caused by writing ${this} in a template]"),console.warn("Attempted to render the template host",e,"inside itself. This is almost always a mistake, and in dev mode ","we render some warning text. In production however, we'll ","render it, which will usually result in an error, and sometimes ","in the element disappearing from the DOM.");return}this._commitNode(e)}else if(kt(e))this._commitIterable(e);else this._commitText(e)}_insert(e){return C(C(this._$startNode).parentNode).insertBefore(e,this._$endNode)}_commitNode(e){if(this._$committedValue!==e){if(this._$clear(),I!==Z){let t=this._$startNode.parentNode?.nodeName;if(t==="STYLE"||t==="SCRIPT"){let i="Forbidden";if(t==="STYLE")i="Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css`...` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.";else i="Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.";throw Error(i)}}l&&l({kind:"commit node",start:this._$startNode,parent:this._$parent,value:e,options:this.options}),this._$committedValue=this._insert(e)}}_commitText(e){if(this._$committedValue!==p&&B(this._$committedValue)){let t=C(this._$startNode).nextSibling;if(this._textSanitizer===void 0)this._textSanitizer=me(t,"data","property");e=this._textSanitizer(e),l&&l({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}else{let t=N.createTextNode("");if(this._commitNode(t),this._textSanitizer===void 0)this._textSanitizer=me(t,"data","property");e=this._textSanitizer(e),l&&l({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}this._$committedValue=e}_commitTemplateResult(e){let{values:t,["_$litType$"]:i}=e,s=typeof i==="number"?this._$getTemplate(e):(i.el===void 0&&(i.el=F.createElement(Be(i.h,i.h[0]),this.options)),i);if(this._$committedValue?._$template===s)l&&l({kind:"template updating",template:s,instance:this._$committedValue,parts:this._$committedValue._$parts,options:this.options,values:t}),this._$committedValue._update(t);else{let r=new Fe(s,this),o=r._clone(this.options);l&&l({kind:"template instantiated",template:s,instance:r,parts:r._$parts,options:this.options,fragment:o,values:t}),r._update(t),l&&l({kind:"template instantiated and updated",template:s,instance:r,parts:r._$parts,options:this.options,fragment:o,values:t}),this._commitNode(o),this._$committedValue=r}}_$getTemplate(e){let t=Le.get(e.strings);if(t===void 0)Le.set(e.strings,t=new F(e));return t}_commitIterable(e){if(!fe(this._$committedValue))this._$committedValue=[],this._$clear();let t=this._$committedValue,i=0,s;for(let r of e){if(i===t.length)t.push(s=new j(this._insert(W()),this._insert(W()),this,this.options));else s=t[i];s._$setValue(r),i++}if(i<t.length)this._$clear(s&&C(s._$endNode).nextSibling,i),t.length=i}_$clear(e=C(this._$startNode).nextSibling,t){this._$notifyConnectionChanged?.(!1,!0,t);while(e!==this._$endNode){let i=C(e).nextSibling;C(e).remove(),e=i}}setConnected(e){if(this._$parent===void 0)this.__isConnected=e,this._$notifyConnectionChanged?.(e);else throw Error("part.setConnected() may only be called on a RootPart returned from render().")}}class q{get tagName(){return this.element.tagName}get _$isConnected(){return this._$parent._$isConnected}constructor(e,t,i,s,r){if(this.type=ge,this._$committedValue=p,this._$disconnectableChildren=void 0,this.element=e,this.name=t,this._$parent=s,this.options=r,i.length>2||i[0]!==""||i[1]!=="")this._$committedValue=Array(i.length-1).fill(new String),this.strings=i;else this._$committedValue=p;this._sanitizer=void 0}_$setValue(e,t=this,i,s){let r=this.strings,o=!1;if(r===void 0){if(e=V(this,e,t,0),o=!B(e)||e!==this._$committedValue&&e!==D,o)this._$committedValue=e}else{let n=e;e=r[0];let a,d;for(a=0;a<r.length-1;a++){if(d=V(this,n[i+a],t,a),d===D)d=this._$committedValue[a];if(o||=!B(d)||d!==this._$committedValue[a],d===p)e=p;else if(e!==p)e+=(d??"")+r[a+1];this._$committedValue[a]=d}}if(o&&!s)this._commitValue(e)}_commitValue(e){if(e===p)C(this.element).removeAttribute(this.name);else{if(this._sanitizer===void 0)this._sanitizer=I(this.element,this.name,"attribute");e=this._sanitizer(e??""),l&&l({kind:"commit attribute",element:this.element,name:this.name,value:e,options:this.options}),C(this.element).setAttribute(this.name,e??"")}}}class je extends q{constructor(){super(...arguments);this.type=Vt}_commitValue(e){if(this._sanitizer===void 0)this._sanitizer=I(this.element,this.name,"property");e=this._sanitizer(e),l&&l({kind:"commit property",element:this.element,name:this.name,value:e,options:this.options}),this.element[this.name]=e===p?void 0:e}}class qe extends q{constructor(){super(...arguments);this.type=Lt}_commitValue(e){l&&l({kind:"commit boolean attribute",element:this.element,name:this.name,value:!!(e&&e!==p),options:this.options}),C(this.element).toggleAttribute(this.name,!!e&&e!==p)}}class Ye extends q{constructor(e,t,i,s,r){super(e,t,i,s,r);if(this.type=Ut,this.strings!==void 0)throw Error(`A \`<${e.localName}>\` has a \`@${t}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`)}_$setValue(e,t=this){if(e=V(this,e,t,0)??p,e===D)return;let i=this._$committedValue,s=e===p&&i!==p||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==p&&(i===p||s);if(l&&l({kind:"commit event listener",element:this.element,name:this.name,value:e,options:this.options,removeListener:s,addListener:r,oldListener:i}),s)this.element.removeEventListener(this.name,this,i);if(r)this.element.addEventListener(this.name,this,e);this._$committedValue=e}handleEvent(e){if(typeof this._$committedValue==="function")this._$committedValue.call(this.options?.host??this.element,e);else this._$committedValue.handleEvent(e)}}class Ke{constructor(e,t,i){this.element=e,this.type=ye,this._$disconnectableChildren=void 0,this._$parent=t,this.options=i}get _$isConnected(){return this._$parent._$isConnected}_$setValue(e){l&&l({kind:"commit to element binding",element:this.element,value:e,options:this.options}),V(this,e)}}var Bt=w.litHtmlPolyfillSupportDevMode;Bt?.(F,j);(w.litHtmlVersions??=[]).push("3.3.3");if(w.litHtmlVersions.length>1)queueMicrotask(()=>{z("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var U=(e,t,i)=>{if(t==null)throw TypeError(`The container to render into may not be ${t}`);let s=Ct++,r=i?.renderBefore??t,o=r._$litPart$;if(l&&l({kind:"begin render",id:s,value:e,container:t,options:i,part:o}),o===void 0){let n=i?.renderBefore??null;r._$litPart$=o=new j(t.insertBefore(W(),n),n,void 0,i??{})}return o._$setValue(e),l&&l({kind:"end render",id:s,value:e,container:t,options:i,part:o}),o};U.setSanitizer=Pt,U.createSanitizer=me,U._testOnlyClearSanitizerFactoryDoNotCallOrElse=Rt;var Ft=(e,t)=>e,_e=!0,k=globalThis,Xe;if(_e)k.litIssuedWarnings??=new Set,Xe=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!k.litIssuedWarnings.has(t)&&!k.litIssuedWarnings.has(e))console.warn(t),k.litIssuedWarnings.add(t)};class y extends v{constructor(){super(...arguments);this.renderOptions={host:this},this.__childPart=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();if(!this.hasUpdated)this.renderOptions.isConnected=this.isConnected;super.update(e),this.__childPart=U(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this.__childPart?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this.__childPart?.setConnected(!1)}render(){return D}}y._$litElement$=!0;y[Ft("finalized",y)]=!0;k.litElementHydrateSupport?.({LitElement:y});var jt=_e?k.litElementPolyfillSupportDevMode:k.litElementPolyfillSupport;jt?.({LitElement:y});(k.litElementVersions??=[]).push("4.2.2");if(_e&&k.litElementVersions.length>1)queueMicrotask(()=>{Xe("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});function Je(e){return e.callWS({type:"camera_hub/config"})}async function ee(e,t,i=30){let s=await e.callWS({type:"auth/sign_path",path:t,expires:i});return e.hassUrl(s.path)}async function Qe(e,t){return(await e.callWS({type:"camera/webrtc/get_client_config",entity_id:t})).configuration?.iceServers??[]}class ve{constructor(e){this.onIdle=e;this.timeoutMs=0}setTimeout(e){this.timeoutMs=e*1000,this.restart()}restart(){if(clearTimeout(this.timer),this.timeoutMs>0)this.timer=setTimeout(this.onIdle,this.timeoutMs)}stop(){clearTimeout(this.timer)}}var P=x`
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
`;var Ge=3600,qt=Ge*1000*0.8;class Ze{constructor(e=Date.now){this.now=e;this.cache=new Map}get(e,t){let i=this.cache.get(t);if(i&&this.now()-i.signedAt<qt)return i.url;let s=ee(e,t,Ge);return this.cache.set(t,{url:s,signedAt:this.now()}),s.catch(()=>this.cache.delete(t)),s}}var Y=new Ze;var Yt=new Set(["cat","dog","bird","horse","deer","bear","raccoon","fox","squirrel"]),Kt=new Set(["car","motorcycle","bicycle","bus","truck","boat"]);function et(e,t){let i=e.data.objects.map((s)=>s.split("-")[0]);switch(t){case"all":return!0;case"person":return i.includes("person");case"animal":return i.some((s)=>Yt.has(s));case"vehicle":return i.some((s)=>Kt.has(s))}}function te(e){let i=(e.data.sub_labels[0]??e.data.objects[0]??"Motion").replace(/[-_]/g," ");return i.charAt(0).toUpperCase()+i.slice(1)}function we(e,t,i){let s=e.filter((r)=>r.id!==t.id);return[t,...s].sort((r,o)=>o.start_time-r.start_time).slice(0,i)}function tt(e,t){let i=Math.max(0,t/1000-e);if(i<60)return"now";if(i<3600)return`${Math.floor(i/60)}m`;if(i<86400)return`${Math.floor(i/3600)}h`;return`${Math.floor(i/86400)}d`}function ie(e,t){let i=t.thumb_path.replace(/^\/media\/frigate\//,"");return`/api/frigate/${encodeURIComponent(e)}/${i}`}function it(e,t){if(t.end_time===null)return;let i=Math.floor(t.start_time-2),s=Math.ceil(t.end_time+2);return`/api/frigate/${encodeURIComponent(e)}/recording/${encodeURIComponent(t.camera)}/start/${i}/end/${s}`}class st extends y{static properties={hass:{attribute:!1},review:{attribute:!1},instanceId:{attribute:!1},cameraName:{attribute:!1},url:{state:!0},poster:{state:!0},playing:{state:!0},error:{state:!0}};constructor(){super();this.onKeyDown=(e)=>{if(e.key==="Escape")this.close()};this.playing=!1}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.onKeyDown)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.onKeyDown)}willUpdate(e){if(e.has("review")){this.url=void 0,this.poster=void 0,this.playing=!1,Y.get(this.hass,ie(this.instanceId,this.review)).then((i)=>this.poster=i,()=>{return}),this.error=void 0;let t=it(this.instanceId,this.review);if(!t)return;Y.get(this.hass,t).then((i)=>this.url=i,(i)=>this.error=i.message??String(i))}}close(){this.dispatchEvent(new CustomEvent("clip-close",{bubbles:!0,composed:!0}))}render(){let e=new Date(this.review.start_time*1000),t=e.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),i=e.toLocaleDateString([],{weekday:"short"});return u`
      <div class="backdrop" @click=${this.close}></div>
      <div class="panel" role="dialog" aria-label="Alert clip">
        <div class="header">
          <div class="title">
            <span class="label">${te(this.review)}</span>
            <span class="meta">${this.cameraName} · ${i} ${t}</span>
          </div>
          <button class="close" @click=${this.close} aria-label="Close">
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <div class="video">
          ${this.poster&&!this.playing?u`<img class="poster" src=${this.poster} alt="" />`:p}
          ${this.url?u`<video
                src=${this.url}
                autoplay
                muted
                playsinline
                controls
                @playing=${()=>this.playing=!0}
                @error=${()=>this.error="The clip could not be loaded"}
              ></video>`:p}
          ${this.error?u`<div class="message">${this.error}</div>`:!this.playing?u`<div class="spinner"></div>`:p}
        </div>
      </div>
    `}static styles=[P,x`
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
        width: min(1100px, 100%);
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
        max-height: calc(100vh - 120px);
        border-radius: var(--ch-radius-main);
        overflow: hidden;
        background: #000;
      }
      .poster {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: fill;
      }
      video {
        position: relative;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .message {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: var(--ch-text-secondary);
      }
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
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
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
    `]}customElements.define("camera-hub-clip-modal",st);async function rt(e,t,i,s,r){let o=await e.callWS({type:"frigate/reviews/get",instance_id:t,cameras:i,severity:"alert",after:s,limit:r});return JSON.parse(o)}function nt(e,t,i){return e.connection.subscribeMessage((s)=>i(JSON.parse(s)),{type:"frigate/reviews/subscribe",instance_id:t})}var ot=24,Se=40,Xt=[{id:"all",label:"All"},{id:"person",label:"People"},{id:"animal",label:"Animals"},{id:"vehicle",label:"Vehicles"}];class at extends y{static properties={hass:{attribute:!1},cameras:{attribute:!1},reviews:{state:!0},filter:{state:!0},thumbnails:{state:!0},now:{state:!0},error:{state:!0}};constructor(){super();this.cameras=[],this.reviews=[],this.filter="all",this.thumbnails={},this.now=Date.now()}get instanceId(){return this.cameras[0]?.instance_id}get cameraNames(){return new Set(this.cameras.map((e)=>e.frigate_name))}connectedCallback(){if(super.connectedCallback(),this.clock=setInterval(()=>this.now=Date.now(),30000),this.hass&&this.cameras.length)this.load()}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.clock),this.unsubscribe?.then((e)=>e()).catch(()=>{return}),this.unsubscribe=void 0}updated(e){if(e.has("cameras")&&this.hass&&this.cameras.length&&!this.unsubscribe)this.load()}async load(){let e=this.instanceId;if(!e||this.unsubscribe)return;this.unsubscribe=nt(this.hass,e,(t)=>{if(t.after.severity!=="alert"||!this.cameraNames.has(t.after.camera))return;this.reviews=we(this.reviews,t.after,Se),this.signThumbnail(t.after)});try{let t=Math.floor(Date.now()/1000)-ot*3600,i=await rt(this.hass,e,[...this.cameraNames],t,Se),s=this.reviews;for(let r of i)s=we(s,r,Se);this.reviews=s;for(let r of s)this.signThumbnail(r);this.error=void 0}catch(t){this.error=t.message??String(t)}}signThumbnail(e){let t=this.instanceId;if(!t)return;Y.get(this.hass,ie(t,e)).then((i)=>this.thumbnails={...this.thumbnails,[e.id]:i},()=>{return})}open(e){this.dispatchEvent(new CustomEvent("clip-open",{detail:e,bubbles:!0,composed:!0}))}cameraName(e){return this.cameras.find((t)=>t.frigate_name===e)?.name??e}render(){let e=this.reviews.filter((t)=>et(t,this.filter));return u`
      <div class="header">
        <span class="title">Recent alerts</span>
        <div class="chips">
          ${Xt.map((t)=>u`
              <button
                class="chip ${this.filter===t.id?"on":""}"
                @click=${()=>this.filter=t.id}
              >
                ${t.label}
              </button>
            `)}
        </div>
      </div>
      ${this.error?u`<div class="empty">Alerts are not available: ${this.error}</div>`:e.length===0?u`<div class="empty">No alerts in the last ${ot} hours.</div>`:u`
              <div class="scroller">
                ${e.map((t)=>this.renderClip(t))}
              </div>
            `}
    `}renderClip(e){let t=this.thumbnails[e.id],i=e.end_time===null;return u`
      <button class="clip" @click=${()=>this.open(e)}>
        ${t?u`<img src=${t} alt="" loading="lazy" />`:p}
        <span class="shade"></span>
        ${i?u`<span class="now"><span class="dot"></span>Now</span>`:p}
        <span class="caption">
          <span class="label">${te(e)}</span>
          <span class="meta">
            ${this.cameraName(e.camera)} · ${tt(e.start_time,this.now)}
          </span>
        </span>
      </button>
    `}static styles=[P,x`
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
    `]}customElements.define("camera-hub-clips-strip",at);function se(e,t,i){let s=e.states[t]?.attributes.entity_picture;if(typeof s!=="string")return;let r=s.includes("?")?"&":"?";return e.hassUrl(`${s}${r}t=${i}`)}function re(e,t){let i=e.states[t]?.state;return i===void 0||i==="unavailable"}var Jt=["avc1.640029","avc1.64002A","avc1.640033","hvc1.1.6.L153.B0","mp4a.40.2","mp4a.40.5","flac","opus"];function ct(e){return Jt.filter((t)=>e(`video/mp4; codecs="${t}"`)).join()}function dt(e,t,i){let s={};if(i-e>3)s.seekTo=i-0.5;let r=s.seekTo??e;if(r-t>10)s.removeEnd=r-5;return s}var Qt=["mse","webrtc"],Gt=5000,Zt=6000,ei=30000;class Ee{constructor(e,t,i){this.getHass=e;this.video=t;this.onStatus=i;this.attempt=0;this.generation=0;t.muted=!0,t.playsInline=!0,t.autoplay=!0,t.addEventListener("playing",()=>{if(this.session)this.attempt=0,this.onStatus({state:"playing",mode:this.session.mode})})}play(e){this.stop(),this.source=e,this.attempt=0,this.connect()}stop(){this.generation++,clearTimeout(this.retryTimer),this.session?.close(),this.session=void 0,this.source=void 0}async connect(){let e=this.source;if(!e)return;let t=++this.generation,i=()=>t===this.generation,s=(o)=>{if(i())this.retry(o)};this.onStatus({state:"connecting"});let r="No video arrived";for(let o of Qt){let n;try{n=await ti(o,this.getHass(),e,this.video,s)}catch(d){if(!i())return;r=d instanceof Error?d.message:String(d);continue}if(!i()){n.close();return}this.session=n;let a=await ii(this.video,Zt);if(!i()||a)return;n.close(),this.session=void 0,r=`No video arrived over ${o.toUpperCase()}`}s(r)}retry(e){this.session?.close(),this.session=void 0;let t=Math.min(ei,1000*2**this.attempt++);this.onStatus({state:"retrying",inSeconds:Math.round(t/1000),reason:e}),this.retryTimer=setTimeout(()=>void this.connect(),t)}}function ti(e,t,i,s,r){return e==="mse"?ni(t,i,s,r):si(t,i,s,r)}function ii(e,t){if(e.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA&&!e.paused)return Promise.resolve(!0);return new Promise((i)=>{let s=(n)=>{clearTimeout(o),e.removeEventListener("playing",r),i(n)},r=()=>s(!0),o=setTimeout(()=>s(!1),t);e.addEventListener("playing",r)})}async function lt(e,t){let i=`/api/frigate/${encodeURIComponent(t.instanceId)}/go2rtc/ws/api/ws?src=${encodeURIComponent(t.stream)}`,s=(await ee(e,i)).replace(/^http/,"ws"),r=new WebSocket(s);return r.binaryType="arraybuffer",await new Promise((o,n)=>{r.onopen=()=>o(),r.onerror=()=>n(Error("Could not open the stream connection"))}),r.onerror=null,r}function xe(e,t,i){if(e.readyState===WebSocket.OPEN)e.send(JSON.stringify({type:t,value:i}))}async function si(e,t,i,s){let[r,o]=await Promise.all([Qe(e,t.iceEntityId),lt(e,t)]),n=new RTCPeerConnection({iceServers:r}),a=!1,d=()=>{if(a=!0,n.close(),o.close(),i.srcObject)i.srcObject=null};n.addTransceiver("video",{direction:"recvonly"}),n.addTransceiver("audio",{direction:"recvonly"});let g=new MediaStream;n.ontrack=(h)=>{if(g.addTrack(h.track),i.srcObject!==g)i.removeAttribute("src"),i.srcObject=g},n.onicecandidate=(h)=>xe(o,"webrtc/candidate",h.candidate?.candidate??""),o.onmessage=(h)=>{if(typeof h.data!=="string")return;let m=JSON.parse(h.data);if(m.type==="webrtc/answer")n.setRemoteDescription({type:"answer",sdp:m.value});else if(m.type==="webrtc/candidate"&&m.value)n.addIceCandidate({candidate:m.value,sdpMid:"0"});else if(m.type==="error")n.close()};let c=await n.createOffer();await n.setLocalDescription(c),xe(o,"webrtc/offer",c.sdp??"");try{await ri(n,Gt)}catch(h){throw d(),h}let f=(h)=>{if(!a)d(),s(h)};return n.onconnectionstatechange=()=>{if(n.connectionState==="failed"||n.connectionState==="closed")f("The WebRTC connection was lost")},o.onclose=()=>f("The stream connection closed"),{mode:"webrtc",close:d}}function ri(e,t){return new Promise((i,s)=>{let r=setTimeout(()=>s(Error("WebRTC timed out")),t);e.onconnectionstatechange=()=>{if(e.connectionState==="connected")clearTimeout(r),i();else if(e.connectionState==="failed"||e.connectionState==="closed")clearTimeout(r),s(Error("WebRTC failed"))}})}async function ni(e,t,i,s){let r=window.ManagedMediaSource,o=r??window.MediaSource;if(!o)throw Error("This browser cannot play the stream");let n=await lt(e,t),a=new o;if(r)i.disableRemotePlayback=!0;i.srcObject=null;let d=URL.createObjectURL(a);i.src=d;let g=!1,c=()=>{g=!0,n.close(),i.removeAttribute("src"),i.load(),URL.revokeObjectURL(d)},f=(S)=>{if(!g)c(),s(S)};await new Promise((S)=>a.addEventListener("sourceopen",S,{once:!0})),xe(n,"mse",ct((S)=>o.isTypeSupported(S)));let h,m=[],T=()=>{if(!h||h.updating||g)return;let S=m.shift();if(S){h.appendBuffer(S);return}if(h.buffered.length===0)return;let R=dt(i.currentTime,h.buffered.start(0),h.buffered.end(h.buffered.length-1));if(R.seekTo!==void 0)i.currentTime=R.seekTo;if(R.removeEnd!==void 0)h.remove(0,R.removeEnd)};return n.onmessage=(S)=>{if(typeof S.data==="string"){let R=JSON.parse(S.data);if(R.type==="mse")h=a.addSourceBuffer(R.value),h.mode="segments",h.addEventListener("updateend",T);else if(R.type==="error")f(R.value);return}m.push(S.data),T()},n.onclose=()=>f("The stream connection closed"),{mode:"mse",close:c}}var pt=180;class ht extends y{static properties={hass:{attribute:!1},camera:{attribute:!1},snapshotRefresh:{attribute:!1},statuses:{state:!0},shown:{state:!0}};constructor(){super();this.players=[];this.target=0;this.onVisibilityChange=()=>{if(document.hidden)this.stopAll();else this.start()};this.statuses=[{state:"connecting"},{state:"connecting"}],this.shown=0}connectedCallback(){if(super.connectedCallback(),document.addEventListener("visibilitychange",this.onVisibilityChange),this.players.length)this.start()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("visibilitychange",this.onVisibilityChange),this.stopAll()}firstUpdated(){let e=[...this.renderRoot.querySelectorAll("video")];this.players=e.map((t,i)=>new Ee(()=>this.hass,t,(s)=>this.onStatus(i,s))),this.start()}updated(e){let t=e.get("camera");if(e.has("camera")&&t&&t.entity_id!==this.camera?.entity_id&&this.players.length)this.switchCamera()}onStatus(e,t){let i=[...this.statuses];if(i[e]=t,this.statuses=i,e===this.target&&t.state==="playing"&&this.shown!==e){let s=this.shown;this.shown=e,setTimeout(()=>{if(this.target!==s)this.players[s]?.stop()},pt+50)}}source(){if(!this.camera)return;return{instanceId:this.camera.instance_id,stream:this.camera.stream,iceEntityId:this.camera.entity_id}}start(){let e=this.source();if(!e||document.hidden)return;this.target=this.shown,this.players[this.target]?.play(e)}switchCamera(){let e=this.source();if(!e||document.hidden)return;if(this.statuses[this.shown].state!=="playing"){this.start();return}this.target=this.shown===0?1:0,this.players[this.target]?.play(e)}stopAll(){for(let e of this.players)e.stop()}render(){let e=this.camera,t=this.statuses[this.target],i=t.state==="playing",s=e?re(this.hass,e.entity_id):!1,r=e&&!s?se(this.hass,e.entity_id,this.snapshotRefresh):void 0;return u`
      <div class="frame">
        <video class=${this.shown===0?"on":""} muted playsinline autoplay></video>
        <video class=${this.shown===1?"on":""} muted playsinline autoplay></video>
        ${r?u`<img class="snapshot ${i?"faded":""}" src=${r} alt="" />`:p}
        <div class="shade top"></div>
        <div class="overlay top">
          <span class="live ${i?"on":""}">
            <span class="dot"></span>${i?"Live":s?"Offline":"Connecting"}
          </span>
          <span class="name">${e?.name??""}</span>
        </div>
        ${s?u`<div class="message">This camera is offline.</div>`:t.state==="retrying"?u`<div class="message">
                ${t.reason}. Trying again in ${t.inSeconds} s.
              </div>`:p}
        ${!i&&!s?u`<div class="spinner ${r?"corner":""}"></div>`:p}
      </div>
    `}static styles=[P,x`
      :host {
        display: block;
      }
      .frame {
        position: relative;
        aspect-ratio: 16 / 9;
        background: #000;
        border-radius: var(--ch-radius-main);
        overflow: hidden;
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
        transition: opacity ${pt}ms ease;
      }
      .snapshot.faded {
        opacity: 0;
      }
      .shade.top {
        position: absolute;
        inset: 0 0 auto 0;
        height: 72px;
        background: linear-gradient(rgba(0, 0, 0, 0.55), transparent);
        pointer-events: none;
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
      .live {
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
      }
      .live .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ch-text-secondary);
      }
      .live.on .dot {
        background: var(--ch-red);
      }
      .message {
        position: absolute;
        inset: auto 16px 16px 16px;
        padding: 10px 14px;
        border-radius: var(--ch-radius-thumb);
        background: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }
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
        animation: spin 0.9s linear infinite;
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
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `]}customElements.define("camera-hub-main-view",ht);class ut extends y{static properties={hass:{attribute:!1},cameras:{attribute:!1},selected:{attribute:!1},refresh:{attribute:!1}};constructor(){super();this.cameras=[],this.refresh=0}select(e){this.dispatchEvent(new CustomEvent("camera-select",{detail:e,bubbles:!0,composed:!0}))}render(){return u`
      <div class="rail">
        ${this.cameras.map((e)=>{let t=re(this.hass,e.entity_id),i=t?void 0:se(this.hass,e.entity_id,this.refresh);return u`
            <button
              class="tile ${e.entity_id===this.selected?"selected":""}"
              @click=${()=>this.select(e.entity_id)}
            >
              <span class="name">${e.name}</span>
              <span class="image">
                ${i?u`<img src=${i} alt="" loading="lazy" />`:u`<span class="offline">${t?"Offline":""}</span>`}
              </span>
            </button>
          `})}
      </div>
    `}static styles=[P,x`
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
      .offline {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 12px;
        color: var(--ch-text-secondary);
      }
    `]}customElements.define("camera-hub-tile-rail",ut);var oi=1e4;class mt extends y{static properties={hass:{attribute:!1},load:{state:!0},selected:{state:!0},snapshotRefresh:{state:!0},openClip:{state:!0}};constructor(){super();this.cardConfig={type:"custom:camera-hub-card"};this.loadStarted=!1;this.idle=new ve(()=>this.selectDefault());this.onVisibilityChange=()=>{if(clearInterval(this.snapshotTimer),!document.hidden)this.refreshSnapshots()};this.load={state:"loading"},this.snapshotRefresh=Date.now(),this.addEventListener("pointerdown",()=>this.idle.restart(),{capture:!0}),this.addEventListener("camera-select",(e)=>{this.selected=e.detail}),this.addEventListener("clip-open",(e)=>this.onClipOpen(e.detail)),this.addEventListener("clip-close",()=>this.openClip=void 0)}setConfig(e){this.cardConfig=e}getCardSize(){return 8}connectedCallback(){if(super.connectedCallback(),document.addEventListener("visibilitychange",this.onVisibilityChange),this.refreshSnapshots(),this.load.state==="ready")this.idle.restart()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("visibilitychange",this.onVisibilityChange),clearInterval(this.snapshotTimer),this.idle.stop()}refreshSnapshots(){this.snapshotRefresh=Date.now(),clearInterval(this.snapshotTimer),this.snapshotTimer=setInterval(()=>this.snapshotRefresh=Date.now(),oi)}updated(){if(this.hass&&!this.loadStarted)this.loadStarted=!0,this.loadConfig()}async loadConfig(){try{let e=await Je(this.hass);if(e.version!=="0.1.0")console.warn(`Camera Hub: the card is 0.1.0 but the integration is ${e.version}. Reload the page to get the new card.`);this.load={state:"ready",config:e},this.selectDefault(),this.idle.setTimeout(e.return_after_seconds)}catch(e){let t=e.message??String(e);this.load={state:"error",message:t}}}defaultCamera(e){let t=this.cardConfig.main_camera??e.default_camera;return e.cameras.find((i)=>i.entity_id===t)??e.cameras[0]}onClipOpen(e){if(e.end_time!==null){this.openClip=e;return}let t=this.cameraByFrigateName(e.camera);if(t)this.selected=t.entity_id}cameraByFrigateName(e){if(this.load.state!=="ready")return;return this.load.config.cameras.find((t)=>t.frigate_name===e)}selectDefault(){if(this.load.state==="ready")this.selected=this.defaultCamera(this.load.config)?.entity_id}render(){if(this.load.state==="loading")return u`<div class="notice">Loading cameras…</div>`;if(this.load.state==="error")return u`<div class="notice">Camera Hub is not available: ${this.load.message}</div>`;let{cameras:e}=this.load.config,t=e.find((i)=>i.entity_id===this.selected);return u`
      <div class="layout">
        <camera-hub-main-view
          .hass=${this.hass}
          .camera=${t}
          .snapshotRefresh=${this.snapshotRefresh}
        ></camera-hub-main-view>
        <camera-hub-tile-rail
          .hass=${this.hass}
          .cameras=${e}
          .selected=${this.selected}
          .refresh=${this.snapshotRefresh}
        ></camera-hub-tile-rail>
        <camera-hub-clips-strip .hass=${this.hass} .cameras=${e}></camera-hub-clips-strip>
      </div>
      ${this.openClip?u`<camera-hub-clip-modal
            .hass=${this.hass}
            .review=${this.openClip}
            .instanceId=${e[0]?.instance_id??""}
            .cameraName=${this.cameraByFrigateName(this.openClip.camera)?.name??this.openClip.camera}
          ></camera-hub-clip-modal>`:p}
    `}static styles=[P,x`
      :host {
        display: block;
        container-type: inline-size;
        background: var(--ch-bg);
        border-radius: var(--ch-radius-main);
        padding: var(--ch-gap);
      }
      .layout {
        display: grid;
        gap: calc(var(--ch-gap) * 1.5) var(--ch-gap);
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas: "main" "clips" "rail";
        --ch-rail-columns: 3;
      }
      camera-hub-main-view {
        grid-area: main;
      }
      camera-hub-clips-strip {
        grid-area: clips;
      }
      camera-hub-tile-rail {
        grid-area: rail;
      }
      /* Tablet and desktop: the tiles sit in a column next to the main view,
         and the alerts run under the main view. */
      @container (min-width: 900px) {
        .layout {
          grid-template-columns: minmax(0, 1fr) clamp(280px, 30%, 420px);
          grid-template-areas: "main rail" "clips rail";
          grid-template-rows: auto 1fr;
          align-items: start;
          --ch-rail-columns: 2;
        }
      }
      .notice {
        padding: 24px;
        color: var(--ch-text-secondary);
      }
    `]}customElements.define("camera-hub-card",mt);var ft=window;ft.customCards??=[];ft.customCards.push({type:"camera-hub-card",name:"Camera Hub",description:"Live cameras, clips and alerts from Frigate."});console.info("Camera Hub card 0.1.0");export{mt as CameraHubCard};
