var G=globalThis,fe=G.ShadowRoot&&(G.ShadyCSS===void 0||G.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ge=Symbol(),Fe=new WeakMap;class ve{constructor(e,t,i){if(this._$cssResult$=!0,i!==ge)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this._strings=t}get styleSheet(){let e=this._styleSheet,t=this._strings;if(fe&&e===void 0){let i=t!==void 0&&t.length===1;if(i)e=Fe.get(t);if(e===void 0){if((this._styleSheet=e=new CSSStyleSheet).replaceSync(this.cssText),i)Fe.set(t,e)}}return e}toString(){return this.cssText}}var Ht=(e)=>{if(e._$cssResult$===!0)return e.cssText;else if(typeof e==="number")return e;else throw Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)},Vt=(e)=>new ve(typeof e==="string"?e:String(e),void 0,ge),b=(e,...t)=>{let i=e.length===1?e[0]:t.reduce((s,r,n)=>s+Ht(r)+e[n+1],e[0]);return new ve(i,e,ge)},Be=(e,t)=>{if(fe)e.adoptedStyleSheets=t.map((i)=>i instanceof CSSStyleSheet?i:i.styleSheet);else for(let i of t){let s=document.createElement("style"),r=G.litNonce;if(r!==void 0)s.setAttribute("nonce",r);s.textContent=i.cssText,e.appendChild(s)}},Ft=(e)=>{let t="";for(let i of e.cssRules)t+=i.cssText;return Vt(t)},be=fe?(e)=>e:(e)=>e instanceof CSSStyleSheet?Ft(e):e;var{is:Bt,defineProperty:Wt,getOwnPropertyDescriptor:We,getOwnPropertyNames:jt,getOwnPropertySymbols:qt,getPrototypeOf:je}=Object,Yt=!1,w=globalThis;if(Yt)w.customElements??=customElements;var _=!0,E,qe=w.trustedTypes,Xt=qe?qe.emptyScript:"",Xe=_?w.reactiveElementPolyfillSupportDevMode:w.reactiveElementPolyfillSupport;if(_)w.litIssuedWarnings??=new Set,E=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!w.litIssuedWarnings.has(t)&&!w.litIssuedWarnings.has(e))console.warn(t),w.litIssuedWarnings.add(t)},queueMicrotask(()=>{if(E("dev-mode","Lit is in dev mode. Not recommended for production!"),w.ShadyDOM?.inUse&&Xe===void 0)E("polyfill-support-missing","Shadow DOM is being polyfilled via `ShadyDOM` but the `polyfill-support` module has not been loaded.")});var Kt=_?(e)=>{if(!w.emitLitDebugLogEvents)return;w.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))}:void 0,I=(e,t)=>e,ye={toAttribute(e,t){switch(t){case Boolean:e=e?Xt:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e);break}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=e!==null;break;case Number:i=e===null?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(s){i=null}break}return i}},Ke=(e,t)=>!Bt(e,t),Ye={attribute:!0,type:String,converter:ye,reflect:!1,useDefault:!1,hasChanged:Ke};Symbol.metadata??=Symbol("metadata");w.litPropertyMetadata??=new WeakMap;class x extends HTMLElement{static addInitializer(e){this.__prepare(),(this._initializers??=[]).push(e)}static get observedAttributes(){return this.finalize(),this.__attributeToPropertyMap&&[...this.__attributeToPropertyMap.keys()]}static createProperty(e,t=Ye){if(t.state)t.attribute=!1;if(this.__prepare(),this.prototype.hasOwnProperty(e))t=Object.create(t),t.wrapped=!0;if(this.elementProperties.set(e,t),!t.noAccessor){let i=_?Symbol.for(`${String(e)} (@property() cache)`):Symbol(),s=this.getPropertyDescriptor(e,i,t);if(s!==void 0)Wt(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){let{get:s,set:r}=We(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};if(_&&s==null){if("value"in(We(this.prototype,e)??{}))throw Error(`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it's actually declared as a value on the prototype. Usually this is due to using @property or @state on a method.`);E("reactive-property-without-getter",`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it does not have a getter. This will be an error in a future version of Lit.`)}return{get:s,set(n){let o=s?.call(this);r?.call(this,n),this.requestUpdate(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ye}static __prepare(){if(this.hasOwnProperty(I("elementProperties",this)))return;let e=je(this);if(e.finalize(),e._initializers!==void 0)this._initializers=[...e._initializers];this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(I("finalized",this)))return;if(this.finalized=!0,this.__prepare(),this.hasOwnProperty(I("properties",this))){let t=this.properties,i=[...jt(t),...qt(t)];for(let s of i)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,s]of t)this.elementProperties.set(i,s)}this.__attributeToPropertyMap=new Map;for(let[t,i]of this.elementProperties){let s=this.__attributeNameForProperty(t,i);if(s!==void 0)this.__attributeToPropertyMap.set(s,t)}if(this.elementStyles=this.finalizeStyles(this.styles),_){if(this.hasOwnProperty("createProperty"))E("no-override-create-property","Overriding ReactiveElement.createProperty() is deprecated. The override will not be called with standard decorators");if(this.hasOwnProperty("getPropertyDescriptor"))E("no-override-get-property-descriptor","Overriding ReactiveElement.getPropertyDescriptor() is deprecated. The override will not be called with standard decorators")}}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let s of i)t.unshift(be(s))}else if(e!==void 0)t.push(be(e));return t}static __attributeNameForProperty(e,t){let i=t.attribute;return i===!1?void 0:typeof i==="string"?i:typeof e==="string"?e.toLowerCase():void 0}constructor(){super();this.__instanceProperties=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.__reflectingProperty=null,this.__initialize()}__initialize(){this.__updatePromise=new Promise((e)=>this.enableUpdating=e),this._$changedProperties=new Map,this.__saveInstanceProperties(),this.requestUpdate(),this.constructor._initializers?.forEach((e)=>e(this))}addController(e){if((this.__controllers??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected)e.hostConnected?.()}removeController(e){this.__controllers?.delete(e)}__saveInstanceProperties(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())if(this.hasOwnProperty(i))e.set(i,this[i]),delete this[i];if(e.size>0)this.__instanceProperties=e}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Be(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this.__controllers?.forEach((e)=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this.__controllers?.forEach((e)=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$attributeToProperty(e,i)}__propertyToAttribute(e,t){let s=this.constructor.elementProperties.get(e),r=this.constructor.__attributeNameForProperty(e,s);if(r!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:ye).toAttribute(t,s.type);if(_&&this.constructor.enabledWarnings.includes("migration")&&o===void 0)E("undefined-attribute-value",`The attribute value for the ${e} property is undefined on element ${this.localName}. The attribute will be removed, but in the previous version of \`ReactiveElement\`, the attribute would not have changed.`);if(this.__reflectingProperty=e,o==null)this.removeAttribute(r);else this.setAttribute(r,o);this.__reflectingProperty=null}}_$attributeToProperty(e,t){let i=this.constructor,s=i.__attributeToPropertyMap.get(e);if(s!==void 0&&this.__reflectingProperty!==s){let r=i.getPropertyOptions(s),n=typeof r.converter==="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:ye;this.__reflectingProperty=s;let o=n.fromAttribute(t,r.type);this[s]=o??this.__defaultValues?.get(s)??o,this.__reflectingProperty=null}}requestUpdate(e,t,i,s=!1,r){if(e!==void 0){if(_&&e instanceof Event)E("","The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()");let n=this.constructor;if(s===!1)r=this[e];if(i??=n.getPropertyOptions(e),(i.hasChanged??Ke)(r,t)||i.useDefault&&i.reflect&&r===this.__defaultValues?.get(e)&&!this.hasAttribute(n.__attributeNameForProperty(e,i)))this._$changeProperty(e,t,i);else return}if(this.isUpdatePending===!1)this.__updatePromise=this.__enqueueUpdate()}_$changeProperty(e,t,{useDefault:i,reflect:s,wrapped:r},n){if(i&&!(this.__defaultValues??=new Map).has(e)){if(this.__defaultValues.set(e,n??t??this[e]),r!==!0||n!==void 0)return}if(!this._$changedProperties.has(e)){if(!this.hasUpdated&&!i)t=void 0;this._$changedProperties.set(e,t)}if(s===!0&&this.__reflectingProperty!==e)(this.__reflectingProperties??=new Set).add(e)}async __enqueueUpdate(){this.isUpdatePending=!0;try{await this.__updatePromise}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();if(e!=null)await e;return!this.isUpdatePending}scheduleUpdate(){let e=this.performUpdate();if(_&&this.constructor.enabledWarnings.includes("async-perform-update")&&typeof e?.then==="function")E("async-perform-update",`Element ${this.localName} returned a Promise from performUpdate(). This behavior is deprecated and will be removed in a future version of ReactiveElement.`);return e}performUpdate(){if(!this.isUpdatePending)return;if(Kt?.({kind:"update"}),!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),_){let r=[...this.constructor.elementProperties.keys()].filter((n)=>this.hasOwnProperty(n)&&(n in je(this)));if(r.length)throw Error(`The following properties on element ${this.localName} will not trigger updates as expected because they are set using class fields: ${r.join(", ")}. Native class fields and some compiled output will overwrite accessors used for detecting changes. See https://lit.dev/msg/class-field-shadowing for more information.`)}if(this.__instanceProperties){for(let[s,r]of this.__instanceProperties)this[s]=r;this.__instanceProperties=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,r]of i){let{wrapped:n}=r,o=this[s];if(n===!0&&!this._$changedProperties.has(s)&&o!==void 0)this._$changeProperty(s,void 0,r,o)}}let e=!1,t=this._$changedProperties;try{if(e=this.shouldUpdate(t),e)this.willUpdate(t),this.__controllers?.forEach((i)=>i.hostUpdate?.()),this.update(t);else this.__markUpdated()}catch(i){throw e=!1,this.__markUpdated(),i}if(e)this._$didUpdate(t)}willUpdate(e){}_$didUpdate(e){if(this.__controllers?.forEach((t)=>t.hostUpdated?.()),!this.hasUpdated)this.hasUpdated=!0,this.firstUpdated(e);if(this.updated(e),_&&this.isUpdatePending&&this.constructor.enabledWarnings.includes("change-in-update"))E("change-in-update",`Element ${this.localName} scheduled an update (generally because a property was set) after an update completed, causing a new update to be scheduled. This is inefficient and should be avoided unless the next update can only be scheduled as a side effect of the previous update.`)}__markUpdated(){this._$changedProperties=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.__updatePromise}shouldUpdate(e){return!0}update(e){this.__reflectingProperties&&=this.__reflectingProperties.forEach((t)=>this.__propertyToAttribute(t,this[t])),this.__markUpdated()}updated(e){}firstUpdated(e){}}x.elementStyles=[];x.shadowRootOptions={mode:"open"};x[I("elementProperties",x)]=new Map;x[I("finalized",x)]=new Map;Xe?.({ReactiveElement:x});if(_){x.enabledWarnings=["change-in-update","async-perform-update"];let e=function(t){if(!t.hasOwnProperty(I("enabledWarnings",t)))t.enabledWarnings=t.enabledWarnings.slice()};x.enableWarning=function(t){if(e(this),!this.enabledWarnings.includes(t))this.enabledWarnings.push(t)},x.disableWarning=function(t){e(this);let i=this.enabledWarnings.indexOf(t);if(i>=0)this.enabledWarnings.splice(i,1)}}(w.reactiveElementVersions??=[]).push("2.1.2");if(_&&w.reactiveElementVersions.length>1)queueMicrotask(()=>{E("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var S=globalThis,h=(e)=>{if(!S.emitLitDebugLogEvents)return;S.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))},Jt=0,W;S.litIssuedWarnings??=new Set,W=(e,t)=>{if(t+=e?` See https://lit.dev/msg/${e} for more information.`:"",!S.litIssuedWarnings.has(t)&&!S.litIssuedWarnings.has(e))console.warn(t),S.litIssuedWarnings.add(t)},queueMicrotask(()=>{W("dev-mode","Lit is in dev mode. Not recommended for production!")});var T=S.ShadyDOM?.inUse&&S.ShadyDOM?.noPatch===!0?S.ShadyDOM.wrap:(e)=>e,Q=S.trustedTypes,Je=Q?Q.createPolicy("lit-html",{createHTML:(e)=>e}):void 0,Zt=(e)=>e,se=(e,t,i)=>Zt,Gt=(e)=>{if(U!==se)throw Error("Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.");U=e},Qt=()=>{U=se},ke=(e,t,i)=>U(e,t,i),st="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,rt="?"+M,ei=`<${rt}>`,L=document,j=()=>L.createComment(""),q=(e)=>e===null||typeof e!="object"&&typeof e!="function",$e=Array.isArray,ti=(e)=>$e(e)||typeof e?.[Symbol.iterator]==="function",we=`[ 	
\f\r]`,ii=`[^ 	
\f\r"'\`<>=]`,si=`[^\\s"'>=/]`,F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ze=1,_e=2,ri=3,Ge=/-->/g,Qe=/>/g,A=new RegExp(`>|${we}(?:(${si}+)(${we}*=${we}*(?:${ii}|("|')|))|$)`,"g"),ni=0,et=1,oi=2,tt=3,xe=/'/g,Se=/"/g,nt=/^(?:script|style|textarea|title)$/i,ai=1,ee=2,te=3,Ee=1,ie=2,ci=3,li=4,di=5,Te=6,pi=7,Ce=(e)=>(t,...i)=>{if(t.some((s)=>s===void 0))console.warn(`Some template strings are undefined.
This is probably caused by illegal octal escape sequences.`);if(i.some((s)=>s?._$litStatic$))W("",`Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.
Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`);return{["_$litType$"]:e,strings:t,values:i}},a=Ce(ai),Xi=Ce(ee),Ki=Ce(te),N=Symbol.for("lit-noChange"),l=Symbol.for("lit-nothing"),it=new WeakMap,O=L.createTreeWalker(L,129),U=se;function ot(e,t){if(!$e(e)||!e.hasOwnProperty("raw")){let i="invalid template strings array";throw i=`
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
`),Error(i)}return Je!==void 0?Je.createHTML(t):t}var hi=(e,t)=>{let i=e.length-1,s=[],r=t===ee?"<svg>":t===te?"<math>":"",n,o=F;for(let d=0;d<i;d++){let f=e[d],p=-1,u,m=0,v;while(m<f.length){if(o.lastIndex=m,v=o.exec(f),v===null)break;if(m=o.lastIndex,o===F){if(v[Ze]==="!--")o=Ge;else if(v[Ze]!==void 0)o=Qe;else if(v[_e]!==void 0){if(nt.test(v[_e]))n=new RegExp(`</${v[_e]}`,"g");o=A}else if(v[ri]!==void 0)throw Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions")}else if(o===A)if(v[ni]===">")o=n??F,p=-1;else if(v[et]===void 0)p=-2;else p=o.lastIndex-v[oi].length,u=v[et],o=v[tt]===void 0?A:v[tt]==='"'?Se:xe;else if(o===Se||o===xe)o=A;else if(o===Ge||o===Qe)o=F;else o=A,n=void 0}console.assert(p===-1||o===A||o===xe||o===Se,"unexpected parse state B");let C=o===A&&e[d+1].startsWith("/>")?" ":"";r+=o===F?f+ei:p>=0?(s.push(u),f.slice(0,p)+st+f.slice(p))+M+C:f+M+(p===-2?d:C)}let c=r+(e[i]||"<?>")+(t===ee?"</svg>":t===te?"</math>":"");return[ot(e,c),s]};class Y{constructor({strings:e,["_$litType$"]:t},i){this.parts=[];let s,r=0,n=0,o=e.length-1,c=this.parts,[d,f]=hi(e,t);if(this.el=Y.createElement(d,i),O.currentNode=this.el.content,t===ee||t===te){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}while((s=O.nextNode())!==null&&c.length<o){if(s.nodeType===1){{let p=s.localName;if(/^(?:textarea|template)$/i.test(p)&&s.innerHTML.includes(M)){let u=`Expressions are not supported inside \`${p}\` elements. See https://lit.dev/msg/expression-in-${p} for more information.`;if(p==="template")throw Error(u);else W("",u)}}if(s.hasAttributes()){for(let p of s.getAttributeNames())if(p.endsWith(st)){let u=f[n++],v=s.getAttribute(p).split(M),C=/([.?@])?(.*)/.exec(u);c.push({type:Ee,index:r,name:C[2],strings:v,ctor:C[1]==="."?ct:C[1]==="?"?lt:C[1]==="@"?dt:K}),s.removeAttribute(p)}else if(p.startsWith(M))c.push({type:Te,index:r}),s.removeAttribute(p)}if(nt.test(s.tagName)){let p=s.textContent.split(M),u=p.length-1;if(u>0){s.textContent=Q?Q.emptyScript:"";for(let m=0;m<u;m++)s.append(p[m],j()),O.nextNode(),c.push({type:ie,index:++r});s.append(p[u],j())}}}else if(s.nodeType===8)if(s.data===rt)c.push({type:ie,index:r});else{let u=-1;while((u=s.data.indexOf(M,u+1))!==-1)c.push({type:pi,index:r}),u+=M.length-1}r++}if(f.length!==n)throw Error('Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=${true} ?disabled=${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: \n`'+e.join("${...}")+"`");h&&h({kind:"template prep",template:this,clonableTemplate:this.el,parts:this.parts,strings:e})}static createElement(e,t){let i=L.createElement("template");return i.innerHTML=e,i}}function z(e,t,i=e,s){if(t===N)return t;let r=s!==void 0?i.__directives?.[s]:i.__directive,n=q(t)?void 0:t._$litDirective$;if(r?.constructor!==n){if(r?._$notifyDirectiveConnectionChanged?.(!1),n===void 0)r=void 0;else r=new n(e),r._$initialize(e,i,s);if(s!==void 0)(i.__directives??=[])[s]=r;else i.__directive=r}if(r!==void 0)t=z(e,r._$resolve(e,t.values),r,s);return t}class at{constructor(e,t){this._$parts=[],this._$disconnectableChildren=void 0,this._$template=e,this._$parent=t}get parentNode(){return this._$parent.parentNode}get _$isConnected(){return this._$parent._$isConnected}_clone(e){let{el:{content:t},parts:i}=this._$template,s=(e?.creationScope??L).importNode(t,!0);O.currentNode=s;let r=O.nextNode(),n=0,o=0,c=i[0];while(c!==void 0){if(n===c.index){let d;if(c.type===ie)d=new X(r,r.nextSibling,this,e);else if(c.type===Ee)d=new c.ctor(r,c.name,c.strings,this,e);else if(c.type===Te)d=new pt(r,this,e);this._$parts.push(d),c=i[++o]}if(n!==c?.index)r=O.nextNode(),n++}return O.currentNode=L,s}_update(e){let t=0;for(let i of this._$parts){if(i!==void 0)if(h&&h({kind:"set part",part:i,value:e[t],valueIndex:t,values:e,templateInstance:this}),i.strings!==void 0)i._$setValue(e,i,t),t+=i.strings.length-2;else i._$setValue(e[t]);t++}}}class X{get _$isConnected(){return this._$parent?._$isConnected??this.__isConnected}constructor(e,t,i,s){this.type=ie,this._$committedValue=l,this._$disconnectableChildren=void 0,this._$startNode=e,this._$endNode=t,this._$parent=i,this.options=s,this.__isConnected=s?.isConnected??!0,this._textSanitizer=void 0}get parentNode(){let e=T(this._$startNode).parentNode,t=this._$parent;if(t!==void 0&&e?.nodeType===11)e=t.parentNode;return e}get startNode(){return this._$startNode}get endNode(){return this._$endNode}_$setValue(e,t=this){if(this.parentNode===null)throw Error("This `ChildPart` has no `parentNode` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's `innerHTML` or `textContent` can do this.");if(e=z(this,e,t),q(e)){if(e===l||e==null||e===""){if(this._$committedValue!==l)h&&h({kind:"commit nothing to child",start:this._$startNode,end:this._$endNode,parent:this._$parent,options:this.options}),this._$clear();this._$committedValue=l}else if(e!==this._$committedValue&&e!==N)this._commitText(e)}else if(e._$litType$!==void 0)this._commitTemplateResult(e);else if(e.nodeType!==void 0){if(this.options?.host===e){this._commitText("[probable mistake: rendered a template's host in itself (commonly caused by writing ${this} in a template]"),console.warn("Attempted to render the template host",e,"inside itself. This is almost always a mistake, and in dev mode ","we render some warning text. In production however, we'll ","render it, which will usually result in an error, and sometimes ","in the element disappearing from the DOM.");return}this._commitNode(e)}else if(ti(e))this._commitIterable(e);else this._commitText(e)}_insert(e){return T(T(this._$startNode).parentNode).insertBefore(e,this._$endNode)}_commitNode(e){if(this._$committedValue!==e){if(this._$clear(),U!==se){let t=this._$startNode.parentNode?.nodeName;if(t==="STYLE"||t==="SCRIPT"){let i="Forbidden";if(t==="STYLE")i="Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css`...` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.";else i="Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.";throw Error(i)}}h&&h({kind:"commit node",start:this._$startNode,parent:this._$parent,value:e,options:this.options}),this._$committedValue=this._insert(e)}}_commitText(e){if(this._$committedValue!==l&&q(this._$committedValue)){let t=T(this._$startNode).nextSibling;if(this._textSanitizer===void 0)this._textSanitizer=ke(t,"data","property");e=this._textSanitizer(e),h&&h({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}else{let t=L.createTextNode("");if(this._commitNode(t),this._textSanitizer===void 0)this._textSanitizer=ke(t,"data","property");e=this._textSanitizer(e),h&&h({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}this._$committedValue=e}_commitTemplateResult(e){let{values:t,["_$litType$"]:i}=e,s=typeof i==="number"?this._$getTemplate(e):(i.el===void 0&&(i.el=Y.createElement(ot(i.h,i.h[0]),this.options)),i);if(this._$committedValue?._$template===s)h&&h({kind:"template updating",template:s,instance:this._$committedValue,parts:this._$committedValue._$parts,options:this.options,values:t}),this._$committedValue._update(t);else{let r=new at(s,this),n=r._clone(this.options);h&&h({kind:"template instantiated",template:s,instance:r,parts:r._$parts,options:this.options,fragment:n,values:t}),r._update(t),h&&h({kind:"template instantiated and updated",template:s,instance:r,parts:r._$parts,options:this.options,fragment:n,values:t}),this._commitNode(n),this._$committedValue=r}}_$getTemplate(e){let t=it.get(e.strings);if(t===void 0)it.set(e.strings,t=new Y(e));return t}_commitIterable(e){if(!$e(this._$committedValue))this._$committedValue=[],this._$clear();let t=this._$committedValue,i=0,s;for(let r of e){if(i===t.length)t.push(s=new X(this._insert(j()),this._insert(j()),this,this.options));else s=t[i];s._$setValue(r),i++}if(i<t.length)this._$clear(s&&T(s._$endNode).nextSibling,i),t.length=i}_$clear(e=T(this._$startNode).nextSibling,t){this._$notifyConnectionChanged?.(!1,!0,t);while(e!==this._$endNode){let i=T(e).nextSibling;T(e).remove(),e=i}}setConnected(e){if(this._$parent===void 0)this.__isConnected=e,this._$notifyConnectionChanged?.(e);else throw Error("part.setConnected() may only be called on a RootPart returned from render().")}}class K{get tagName(){return this.element.tagName}get _$isConnected(){return this._$parent._$isConnected}constructor(e,t,i,s,r){if(this.type=Ee,this._$committedValue=l,this._$disconnectableChildren=void 0,this.element=e,this.name=t,this._$parent=s,this.options=r,i.length>2||i[0]!==""||i[1]!=="")this._$committedValue=Array(i.length-1).fill(new String),this.strings=i;else this._$committedValue=l;this._sanitizer=void 0}_$setValue(e,t=this,i,s){let r=this.strings,n=!1;if(r===void 0){if(e=z(this,e,t,0),n=!q(e)||e!==this._$committedValue&&e!==N,n)this._$committedValue=e}else{let o=e;e=r[0];let c,d;for(c=0;c<r.length-1;c++){if(d=z(this,o[i+c],t,c),d===N)d=this._$committedValue[c];if(n||=!q(d)||d!==this._$committedValue[c],d===l)e=l;else if(e!==l)e+=(d??"")+r[c+1];this._$committedValue[c]=d}}if(n&&!s)this._commitValue(e)}_commitValue(e){if(e===l)T(this.element).removeAttribute(this.name);else{if(this._sanitizer===void 0)this._sanitizer=U(this.element,this.name,"attribute");e=this._sanitizer(e??""),h&&h({kind:"commit attribute",element:this.element,name:this.name,value:e,options:this.options}),T(this.element).setAttribute(this.name,e??"")}}}class ct extends K{constructor(){super(...arguments);this.type=ci}_commitValue(e){if(this._sanitizer===void 0)this._sanitizer=U(this.element,this.name,"property");e=this._sanitizer(e),h&&h({kind:"commit property",element:this.element,name:this.name,value:e,options:this.options}),this.element[this.name]=e===l?void 0:e}}class lt extends K{constructor(){super(...arguments);this.type=li}_commitValue(e){h&&h({kind:"commit boolean attribute",element:this.element,name:this.name,value:!!(e&&e!==l),options:this.options}),T(this.element).toggleAttribute(this.name,!!e&&e!==l)}}class dt extends K{constructor(e,t,i,s,r){super(e,t,i,s,r);if(this.type=di,this.strings!==void 0)throw Error(`A \`<${e.localName}>\` has a \`@${t}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`)}_$setValue(e,t=this){if(e=z(this,e,t,0)??l,e===N)return;let i=this._$committedValue,s=e===l&&i!==l||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==l&&(i===l||s);if(h&&h({kind:"commit event listener",element:this.element,name:this.name,value:e,options:this.options,removeListener:s,addListener:r,oldListener:i}),s)this.element.removeEventListener(this.name,this,i);if(r)this.element.addEventListener(this.name,this,e);this._$committedValue=e}handleEvent(e){if(typeof this._$committedValue==="function")this._$committedValue.call(this.options?.host??this.element,e);else this._$committedValue.handleEvent(e)}}class pt{constructor(e,t,i){this.element=e,this.type=Te,this._$disconnectableChildren=void 0,this._$parent=t,this.options=i}get _$isConnected(){return this._$parent._$isConnected}_$setValue(e){h&&h({kind:"commit to element binding",element:this.element,value:e,options:this.options}),z(this,e)}}var ui=S.litHtmlPolyfillSupportDevMode;ui?.(Y,X);(S.litHtmlVersions??=[]).push("3.3.3");if(S.litHtmlVersions.length>1)queueMicrotask(()=>{W("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var B=(e,t,i)=>{if(t==null)throw TypeError(`The container to render into may not be ${t}`);let s=Jt++,r=i?.renderBefore??t,n=r._$litPart$;if(h&&h({kind:"begin render",id:s,value:e,container:t,options:i,part:n}),n===void 0){let o=i?.renderBefore??null;r._$litPart$=n=new X(t.insertBefore(j(),o),o,void 0,i??{})}return n._$setValue(e),h&&h({kind:"end render",id:s,value:e,container:t,options:i,part:n}),n};B.setSanitizer=Gt,B.createSanitizer=ke,B._testOnlyClearSanitizerFactoryDoNotCallOrElse=Qt;var mi=(e,t)=>e,Pe=!0,R=globalThis,ht;if(Pe)R.litIssuedWarnings??=new Set,ht=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!R.litIssuedWarnings.has(t)&&!R.litIssuedWarnings.has(e))console.warn(t),R.litIssuedWarnings.add(t)};class g extends x{constructor(){super(...arguments);this.renderOptions={host:this},this.__childPart=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();if(!this.hasUpdated)this.renderOptions.isConnected=this.isConnected;super.update(e),this.__childPart=B(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this.__childPart?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this.__childPart?.setConnected(!1)}render(){return N}}g._$litElement$=!0;g[mi("finalized",g)]=!0;R.litElementHydrateSupport?.({LitElement:g});var fi=Pe?R.litElementPolyfillSupportDevMode:R.litElementPolyfillSupport;fi?.({LitElement:g});(R.litElementVersions??=[]).push("4.2.2");if(Pe&&R.litElementVersions.length>1)queueMicrotask(()=>{ht("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});function ut(e){return e.callWS({type:"camera_hub/config"})}async function re(e,t,i=30){let s=await e.callWS({type:"auth/sign_path",path:t,expires:i});return e.hassUrl(s.path)}async function ne(e,t){return(await e.callWS({type:"camera/webrtc/get_client_config",entity_id:t})).configuration?.iceServers??[]}class Me{constructor(e){this.onIdle=e;this.timeoutMs=0}setTimeout(e){this.timeoutMs=e*1000,this.restart()}restart(){if(clearTimeout(this.timer),this.timeoutMs>0)this.timer=setTimeout(this.onIdle,this.timeoutMs)}stop(){clearTimeout(this.timer)}}async function mt(e,t,i,s,r){let n=await e.callWS({type:"frigate/reviews/get",instance_id:t,cameras:i,severity:"alert",after:s,limit:r});return JSON.parse(n)}function ft(e,t,i){return e.connection.subscribeMessage((s)=>i(JSON.parse(s)),{type:"frigate/reviews/subscribe",instance_id:t})}var gi=new Set(["cat","dog","bird","horse","deer","bear","raccoon","fox","squirrel"]),vi=new Set(["car","motorcycle","bicycle","bus","truck","boat"]);function gt(e,t){let i=e.data.objects.map((s)=>s.split("-")[0]);switch(t){case"all":return!0;case"person":return i.includes("person");case"animal":return i.some((s)=>gi.has(s));case"vehicle":return i.some((s)=>vi.has(s))}}function H(e){let i=(e.data.sub_labels[0]??e.data.objects[0]??"Motion").replace(/[-_]/g," ");return i.charAt(0).toUpperCase()+i.slice(1)}function Re(e,t,i){let s=e.filter((r)=>r.id!==t.id);return[t,...s].sort((r,n)=>n.start_time-r.start_time).slice(0,i)}function vt(e,t){let i=Math.max(0,t/1000-e);if(i<60)return"now";if(i<3600)return`${Math.floor(i/60)}m`;if(i<86400)return`${Math.floor(i/3600)}h`;return`${Math.floor(i/86400)}d`}function oe(e,t){let i=t.thumb_path.replace(/^\/media\/frigate\//,"");return`/api/frigate/${encodeURIComponent(e)}/${i}`}function Ae(e,t,i,s){return`/api/frigate/${encodeURIComponent(e)}/vod/${encodeURIComponent(t)}/start/${Math.floor(i)}/end/${Math.ceil(s)}/index.m3u8`}function bt(e,t){if(t.end_time===null)return;return Ae(e,t.camera,t.start_time-2,t.end_time+2)}var yt=24,Oe=60;class Le{constructor(){this.reviews=[];this.hours=yt;this.listeners=new Set}start(e,t,i){if(this.unsubscribe)return;let s=new Set(i);this.unsubscribe=ft(e,t,(n)=>{if(n.after.severity!=="alert"||!s.has(n.after.camera))return;this.reviews=Re(this.reviews,n.after,Oe),this.notify()});let r=Math.floor(Date.now()/1000)-yt*3600;mt(e,t,i,r,Oe).then((n)=>{let o=this.reviews;for(let c of n)o=Re(o,c,Oe);this.reviews=o,this.error=void 0,this.notify()},(n)=>{this.error=n.message??String(n),this.notify()})}stop(){this.unsubscribe?.then((e)=>e()).catch(()=>{return}),this.unsubscribe=void 0}onChange(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(){for(let e of this.listeners)e()}}var y=b`
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
`,ae=b`
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
`;var wt=3600,bi=wt*1000*0.8;class _t{constructor(e=Date.now){this.now=e;this.cache=new Map}get(e,t){let i=this.cache.get(t);if(i&&this.now()-i.signedAt<bi)return i.url;let s=re(e,t,wt);return this.cache.set(t,{url:s,signedAt:this.now()}),s.catch(()=>this.cache.delete(t)),s}}var D=new _t;function xt(e){let t=e.split(/\r?\n/).map((o)=>o.trim());if(t[0]!=="#EXTM3U")throw Error("Not an HLS playlist");let i,s,r=0,n=[];for(let o of t)if(o.startsWith("#EXT-X-MAP:"))i=/URI="([^"]+)"/.exec(o)?.[1];else if(o.startsWith("#EXTINF:"))s=Number.parseFloat(o.slice(8));else if(o&&!o.startsWith("#")&&s!==void 0)n.push({uri:o,start:r,duration:s}),r+=s,s=void 0;if(!i)throw Error("The playlist has no fMP4 init segment");return{initUri:i,segments:n,duration:r}}function Ne(e,t){if(e.length===0)return-1;let i=0,s=e.length-1;while(i<s){let r=Math.ceil((i+s)/2);if(e[r].start<=t)i=r;else s=r-1}return i}function St(e,t){let i=new URL(e),s=new URL(t,i),r=i.searchParams.get("authSig");if(r&&!s.searchParams.has("authSig"))s.searchParams.set("authSig",r);return s.toString()}function V(e,t,i=0){let[s,r,n,o]=[...t].map((c)=>c.charCodeAt(0));for(let c=i;c+3<e.length;c++)if(e[c]===s&&e[c+1]===r&&e[c+2]===n&&e[c+3]===o)return c;return-1}var Ue=(e)=>e.toString(16).toUpperCase().padStart(2,"0");function yi(e){let t=V(e,"avcC");if(t>=0)return`avc1.${Ue(e[t+5])}${Ue(e[t+6])}${Ue(e[t+7])}`;let i=V(e,"hvcC");if(i>=0){let s=e[i+5]&31,r=e[i+16];return`hvc1.${s}.6.L${r}.B0`}return}function wi(e){if(V(e,"Opus")>=0)return"opus";if(V(e,"fLaC")>=0)return"flac";let t=V(e,"mp4a");if(t<0)return;let i=V(e,"esds",t);return`mp4a.40.${(i>=0?_i(e,i+8):void 0)??2}`}function _i(e,t){let i=(f)=>{let p=e[f],u=0,m=f+1;for(let v=0;v<4;v++,m++)if(u=u<<7|e[m]&127,!(e[m]&128)){m++;break}return{tag:p,body:m,end:m+u}},s=i(t);if(s.tag!==3)return;let r=e[s.body+2],n=s.body+3;if(r&128)n+=2;if(r&64)n+=1+e[n];if(r&32)n+=2;let o=i(n);if(o.tag!==4)return;let c=i(o.body+13);if(c.tag!==5)return;let d=e[c.body]>>3;return d>0?d:void 0}function kt(e){let t=[yi(e),wi(e)].filter(Boolean);if(t.length===0)throw Error("The recording has no known codec");return t.join(",")}var $t=30,xi=60;class J{constructor(e,t){this.video=e;this.onState=t;this.playlistUrl="";this.loaded=new Set;this.loading=!1;this.closed=!1;this.abort=new AbortController;this.fill=async()=>{let e=this.playlist;if(!e||this.loading||this.closed)return;this.loading=!0;try{let i=this.video.currentTime,s=Ne(e.segments,i);for(let r=s;r<e.segments.length;r++){let n=e.segments[r];if(n.start>i+$t)break;if(this.loaded.has(r))continue;if(await this.append(await this.fetchBytes(n.uri)),this.loaded.add(r),Math.abs(this.video.currentTime-i)>n.duration)break}await this.trim()}catch(i){if(!this.closed)this.onState("error",i instanceof Error?i.message:String(i))}finally{this.loading=!1}let t=Ne(e.segments,this.video.currentTime);if(!this.closed&&t>=0&&!this.loaded.has(t))this.fill()}}get duration(){return this.playlist?.duration??0}async load(e,t=0){this.onState("loading");try{let i=await fetch(e,{signal:this.abort.signal});if(!i.ok)throw Error(`The recording is not available (${i.status})`);if(this.playlist=xt(await i.text()),this.playlistUrl=e,this.playlist.segments.length===0)throw Error("There is no recording for this time");let s=new Uint8Array(await this.fetchBytes(this.playlist.initUri)),r=new MediaSource;this.objectUrl=URL.createObjectURL(r),this.video.src=this.objectUrl,await new Promise((n)=>r.addEventListener("sourceopen",n,{once:!0})),r.duration=this.playlist.duration,this.buffer=r.addSourceBuffer(`video/mp4; codecs="${kt(s)}"`),this.buffer.mode="segments",await this.append(s.buffer),this.video.addEventListener("timeupdate",this.fill),this.video.addEventListener("seeking",this.fill),this.video.currentTime=t,await this.fill(),this.onState("ready"),this.video.play().catch(()=>{return})}catch(i){if(this.closed)return;this.onState("error",i instanceof Error?i.message:String(i))}}close(){if(this.closed=!0,this.abort.abort(),this.video.removeEventListener("timeupdate",this.fill),this.video.removeEventListener("seeking",this.fill),this.video.removeAttribute("src"),this.video.load(),this.objectUrl)URL.revokeObjectURL(this.objectUrl)}async trim(){let e=this.playlist,t=this.buffer;if(!e||!t)return;let i=this.video.currentTime-xi,s=this.video.currentTime+$t*2;if(i>0)await this.remove(0,i);if(s<e.duration)await this.remove(s,e.duration);for(let r of[...this.loaded]){let n=e.segments[r];if(n.start+n.duration<=i||n.start>=s)this.loaded.delete(r)}}async fetchBytes(e){let t=await fetch(St(this.playlistUrl,e),{signal:this.abort.signal});if(!t.ok)throw Error(`A part of the recording did not load (${t.status})`);return t.arrayBuffer()}append(e){return this.whenIdle(()=>this.buffer.appendBuffer(e))}remove(e,t){if(t<=e)return Promise.resolve();return this.whenIdle(()=>this.buffer.remove(e,t))}whenIdle(e){let t=this.buffer;if(!t)return Promise.resolve();return new Promise((i,s)=>{let r=()=>{t.removeEventListener("error",n),i()},n=()=>{t.removeEventListener("updateend",r),s(Error("The browser could not play this part of the recording"))};t.addEventListener("updateend",r,{once:!0}),t.addEventListener("error",n,{once:!0}),e()})}}var De=[1,2,4];class Et extends g{static properties={mode:{attribute:!1},paused:{attribute:!1},muted:{attribute:!1},position:{attribute:!1},duration:{attribute:!1},clockStart:{attribute:!1},rate:{attribute:!1},talk:{attribute:!1},fullscreen:{attribute:!1},rewinding:{attribute:!1},ptz:{attribute:!1},ptzOpen:{attribute:!1},dragging:{state:!0}};constructor(){super();this.mode="live",this.paused=!1,this.muted=!0,this.position=0,this.duration=0,this.rate=1,this.fullscreen=!1,this.rewinding=!1,this.ptz=!1,this.ptzOpen=!1}send(e){this.dispatchEvent(new CustomEvent("control",{detail:e,bubbles:!0,composed:!0}))}button(e,t,i,s=""){return a`<button
      class="control ${s}"
      aria-label=${t}
      title=${t}
      @click=${(r)=>{r.stopPropagation(),this.send(i)}}
    >
      <ha-icon icon=${e}></ha-icon>
    </button>`}timeLabel(e){if(this.mode==="playback"&&this.clockStart!==void 0)return new Date((this.clockStart+e)*1000).toLocaleTimeString([],{hour:"numeric",minute:"2-digit",second:"2-digit"});let t=Math.max(0,Math.floor(e));return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}render(){return this.mode==="live"?this.renderLive():this.renderPlayback()}renderLive(){let e=this.talk;return a`
      <div class="bar">
        ${this.muted?this.button("mdi:volume-off","Sound on",{action:"unmute"}):this.button("mdi:volume-high","Sound off",{action:"mute"})}
        ${e?a`<button
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
            </button>`:l}
        ${this.ptz?this.button("mdi:arrow-all",this.ptzOpen?"Close pan and tilt":"Pan and tilt",{action:"ptz"},this.ptzOpen?"on":""):l}
        <span class="spacer"></span>
        ${this.button("mdi:history",this.rewinding?"Close timeline":"Rewind",{action:"rewind"},this.rewinding?"on":"")}
        ${this.button(this.fullscreen?"mdi:fullscreen-exit":"mdi:fullscreen","Full screen",{action:"fullscreen"})}
      </div>
    `}renderPlayback(){let e=this.dragging??this.position;return a`
      <div class="bar">
        ${this.paused?this.button("mdi:play","Play",{action:"play"}):this.button("mdi:pause","Pause",{action:"pause"})}
        ${this.button("mdi:rewind-10","Back 10 seconds",{action:"skip",seconds:-10})}
        ${this.button("mdi:fast-forward-10","Forward 10 seconds",{action:"skip",seconds:10})}
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
        ${this.mode==="clip"?a`<span class="time">${this.timeLabel(this.duration)}</span>`:l}
        <button
          class="control rate"
          aria-label="Playback speed"
          @click=${(t)=>{t.stopPropagation();let i=De[(De.indexOf(this.rate)+1)%De.length];this.send({action:"rate",rate:i})}}
        >
          ${this.rate}×
        </button>
        ${this.muted?this.button("mdi:volume-off","Sound on",{action:"unmute"}):this.button("mdi:volume-high","Sound off",{action:"mute"})}
        ${this.mode==="playback"?this.button("mdi:history",this.rewinding?"Close timeline":"Timeline",{action:"rewind"},this.rewinding?"on":""):l}
        ${this.button(this.fullscreen?"mdi:fullscreen-exit":"mdi:fullscreen","Full screen",{action:"fullscreen"})}
        ${this.mode==="playback"?a`<button
              class="control live"
              aria-label="Back to live"
              @click=${(t)=>{t.stopPropagation(),this.send({action:"live"})}}
            >
              <span class="dot"></span>Live
            </button>`:l}
      </div>
    `}static styles=[y,b`
      :host {
        display: block;
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
    `]}customElements.define("camera-hub-player-controls",Et);class Tt extends g{static properties={hass:{attribute:!1},review:{attribute:!1},instanceId:{attribute:!1},cameraName:{attribute:!1},poster:{state:!0},vodState:{state:!0},message:{state:!0},playing:{state:!0},paused:{state:!0},muted:{state:!0},position:{state:!0},duration:{state:!0},rate:{state:!0},fullscreen:{state:!0}};constructor(){super();this.onKeyDown=(e)=>{if(e.key==="Escape")this.close()};this.onFullscreenChange=()=>{this.fullscreen=document.fullscreenElement===this.frame};this.vodState="loading",this.playing=!1,this.paused=!1,this.muted=!0,this.position=0,this.duration=0,this.rate=1,this.fullscreen=!1}get video(){return this.renderRoot.querySelector("video")}get frame(){return this.renderRoot.querySelector(".video")}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this.onKeyDown),document.addEventListener("fullscreenchange",this.onFullscreenChange)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this.onKeyDown),document.removeEventListener("fullscreenchange",this.onFullscreenChange),this.player?.close()}firstUpdated(){let e=this.video;e.addEventListener("playing",()=>this.playing=!0),e.addEventListener("timeupdate",()=>this.position=e.currentTime),e.addEventListener("durationchange",()=>this.duration=e.duration||0),e.addEventListener("play",()=>this.paused=!1),e.addEventListener("pause",()=>this.paused=!0),this.load()}updated(e){if(e.has("review")&&e.get("review"))this.load();if(this.video)this.video.muted=this.muted}load(){let e=this.video;if(!e)return;this.player?.close(),this.poster=void 0,this.playing=!1,this.position=0,D.get(this.hass,oe(this.instanceId,this.review)).then((s)=>this.poster=s,()=>{return});let t=bt(this.instanceId,this.review);if(!t)return;let i=new J(e,(s,r)=>{this.vodState=s,this.message=r});this.player=i,D.get(this.hass,t).then((s)=>{if(this.player===i)i.load(s)},(s)=>{this.vodState="error",this.message=s.message??String(s)})}onControl(e){let t=this.video,i=e.detail;if(!t)return;switch(i.action){case"play":t.play();break;case"pause":t.pause();break;case"seek":t.currentTime=i.seconds;break;case"skip":t.currentTime=Math.max(0,t.currentTime+i.seconds);break;case"rate":this.rate=i.rate,t.playbackRate=i.rate;break;case"mute":this.muted=!0;break;case"unmute":this.muted=!1;break;case"fullscreen":if(document.fullscreenElement)document.exitFullscreen();else this.frame?.requestFullscreen?.();break;default:break}}close(){this.dispatchEvent(new CustomEvent("clip-close",{bubbles:!0,composed:!0}))}render(){let e=new Date(this.review.start_time*1000),t=e.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),i=e.toLocaleDateString([],{weekday:"short"});return a`
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
          ${this.poster&&!this.playing?a`<img class="poster" src=${this.poster} alt="" />`:l}
          ${this.vodState==="error"?a`<div class="message">${this.message}</div>`:!this.playing?a`<div class="spinner"></div>`:l}
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
    `}static styles=[y,ae,b`
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
    `]}customElements.define("camera-hub-clip-modal",Tt);var Si=[{id:"all",label:"All"},{id:"person",label:"People"},{id:"animal",label:"Animals"},{id:"vehicle",label:"Vehicles"}];class Ct extends g{static properties={hass:{attribute:!1},cameras:{attribute:!1},store:{attribute:!1},filter:{state:!0},thumbnails:{state:!0},now:{state:!0},revision:{state:!0}};constructor(){super();this.cameras=[],this.filter="all",this.thumbnails={},this.now=Date.now(),this.revision=0}get instanceId(){return this.cameras[0]?.instance_id}connectedCallback(){super.connectedCallback(),this.clock=setInterval(()=>this.now=Date.now(),30000),this.listen()}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.clock),this.stopListening?.(),this.stopListening=void 0}updated(e){if(e.has("store"))this.listen()}listen(){if(!this.store||this.stopListening)return;this.stopListening=this.store.onChange(()=>{this.revision++,this.signThumbnails()}),this.signThumbnails()}signThumbnails(){let e=this.instanceId;if(!e||!this.hass)return;for(let t of this.store.reviews){if(this.thumbnails[t.id])continue;D.get(this.hass,oe(e,t)).then((i)=>this.thumbnails={...this.thumbnails,[t.id]:i},()=>{return})}}open(e){this.dispatchEvent(new CustomEvent("clip-open",{detail:e,bubbles:!0,composed:!0}))}cameraName(e){return this.cameras.find((t)=>t.frigate_name===e)?.name??e}render(){let t=(this.store?.reviews??[]).filter((i)=>gt(i,this.filter));return a`
      <div class="header">
        <span class="title">Recent alerts</span>
        <div class="chips">
          ${Si.map((i)=>a`
              <button
                class="chip ${this.filter===i.id?"on":""}"
                @click=${()=>this.filter=i.id}
              >
                ${i.label}
              </button>
            `)}
        </div>
      </div>
      ${this.store?.error?a`<div class="empty">Alerts are not available: ${this.store.error}</div>`:t.length===0?a`<div class="empty">No alerts in the last ${this.store?.hours??24} hours.</div>`:a`
              <div class="scroller">
                ${t.map((i)=>this.renderClip(i))}
              </div>
            `}
    `}renderClip(e){let t=this.thumbnails[e.id],i=e.end_time===null;return a`
      <button class="clip" @click=${()=>this.open(e)}>
        ${t?a`<img src=${t} alt="" loading="lazy" />`:l}
        <span class="shade"></span>
        ${i?a`<span class="now"><span class="dot"></span>Now</span>`:l}
        <span class="caption">
          <span class="label">${H(e)}</span>
          <span class="meta">
            ${this.cameraName(e.camera)} · ${vt(e.start_time,this.now)}
          </span>
        </span>
      </button>
    `}static styles=[y,b`
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
    `]}customElements.define("camera-hub-clips-strip",Ct);function ce(e,t,i){let s=e.states[t]?.attributes.entity_picture;if(typeof s!=="string")return;let r=s.includes("?")?"&":"?";return e.hassUrl(`${s}${r}t=${i}`)}function le(e,t){let i=e.states[t]?.state;return i===void 0||i==="unavailable"}async function Z(e,t){let i=`/api/frigate/${encodeURIComponent(t.instanceId)}/go2rtc/ws/api/ws?src=${encodeURIComponent(t.stream)}`,s=(await re(e,i)).replace(/^http/,"ws"),r=new WebSocket(s);return r.binaryType="arraybuffer",await new Promise((n,o)=>{r.onopen=()=>n(),r.onerror=()=>o(Error("Could not open the stream connection"))}),r.onerror=null,r}function de(e,t,i){if(e.readyState===WebSocket.OPEN)e.send(JSON.stringify({type:t,value:i}))}function pe(e,t){return new Promise((i,s)=>{let r=setTimeout(()=>s(Error("WebRTC timed out")),t);e.onconnectionstatechange=()=>{if(e.connectionState==="connected")clearTimeout(r),i();else if(e.connectionState==="failed"||e.connectionState==="closed")clearTimeout(r),s(Error("WebRTC failed"))}})}async function he(e,t){t.onicecandidate=(s)=>de(e,"webrtc/candidate",s.candidate?.candidate??""),e.addEventListener("message",(s)=>{if(typeof s.data!=="string")return;let r=JSON.parse(s.data);if(r.type==="webrtc/answer")t.setRemoteDescription({type:"answer",sdp:r.value});else if(r.type==="webrtc/candidate"&&r.value)t.addIceCandidate({candidate:r.value,sdpMid:"0"});else if(r.type==="error")t.close()});let i=await t.createOffer();await t.setLocalDescription(i),de(e,"webrtc/offer",i.sdp??"")}var ki=["avc1.640029","avc1.64002A","avc1.640033","hvc1.1.6.L153.B0","mp4a.40.2","mp4a.40.5","flac","opus"];function Pt(e){return ki.filter((t)=>e(`video/mp4; codecs="${t}"`)).join()}function Mt(e,t,i){let s={};if(i-e>3)s.seekTo=i-0.5;else if(e<t)s.seekTo=t;let r=s.seekTo??e;if(r-t>10)s.removeEnd=r-5;return s}var $i=["mse","webrtc"],Ei=5000,Ti=6000,Ci=30000;class Ie{constructor(e,t,i){this.getHass=e;this.video=t;this.onStatus=i;this.attempt=0;this.generation=0;t.muted=!0,t.playsInline=!0,t.autoplay=!0,t.addEventListener("playing",()=>{if(this.session)this.attempt=0,this.onStatus({state:"playing",mode:this.session.mode})})}play(e){this.stop(),this.source=e,this.attempt=0,this.connect()}stop(){this.generation++,clearTimeout(this.retryTimer),this.session?.close(),this.session=void 0,this.source=void 0}async connect(){let e=this.source;if(!e)return;let t=++this.generation,i=()=>t===this.generation,s=(n)=>{if(i())this.retry(n)};this.onStatus({state:"connecting"});let r="No video arrived";for(let n of $i){let o;try{o=await Pi(n,this.getHass(),e,this.video,s)}catch(d){if(!i())return;r=d instanceof Error?d.message:String(d);continue}if(!i()){o.close();return}this.session=o;let c=await Mi(this.video,Ti);if(!i()||c)return;o.close(),this.session=void 0,r=`No video arrived over ${n.toUpperCase()}`}s(r)}retry(e){this.session?.close(),this.session=void 0;let t=Math.min(Ci,1000*2**this.attempt++);this.onStatus({state:"retrying",inSeconds:Math.round(t/1000),reason:e}),this.retryTimer=setTimeout(()=>void this.connect(),t)}}function Pi(e,t,i,s,r){return e==="mse"?Ai(t,i,s,r):Ri(t,i,s,r)}function Mi(e,t){if(e.readyState>=HTMLMediaElement.HAVE_CURRENT_DATA&&!e.paused)return Promise.resolve(!0);return new Promise((i)=>{let s=(o)=>{clearTimeout(n),e.removeEventListener("playing",r),i(o)},r=()=>s(!0),n=setTimeout(()=>s(!1),t);e.addEventListener("playing",r)})}async function Ri(e,t,i,s){let[r,n]=await Promise.all([ne(e,t.iceEntityId),Z(e,t)]),o=new RTCPeerConnection({iceServers:r}),c=!1,d=()=>{if(c=!0,o.close(),n.close(),i.srcObject)i.srcObject=null};o.addTransceiver("video",{direction:"recvonly"}),o.addTransceiver("audio",{direction:"recvonly"});let f=new MediaStream;o.ontrack=(u)=>{if(f.addTrack(u.track),i.srcObject!==f)i.removeAttribute("src"),i.srcObject=f},await he(n,o);try{await pe(o,Ei)}catch(u){throw d(),u}let p=(u)=>{if(!c)d(),s(u)};return o.onconnectionstatechange=()=>{if(o.connectionState==="failed"||o.connectionState==="closed")p("The WebRTC connection was lost")},n.onclose=()=>p("The stream connection closed"),{mode:"webrtc",close:d}}async function Ai(e,t,i,s){let r=window.ManagedMediaSource,n=r??window.MediaSource;if(!n)throw Error("This browser cannot play the stream");let o=await Z(e,t),c=new n;if(r)i.disableRemotePlayback=!0;i.srcObject=null;let d=URL.createObjectURL(c);i.src=d;let f=!1,p=()=>{f=!0,o.close(),i.removeAttribute("src"),i.load(),URL.revokeObjectURL(d)},u=(k)=>{if(!f)p(),s(k)};await new Promise((k)=>c.addEventListener("sourceopen",k,{once:!0})),de(o,"mse",Pt((k)=>n.isTypeSupported(k)));let m,v=[],C=()=>{if(!m||m.updating||f)return;let k=v.shift();if(k){m.appendBuffer(k);return}if(m.buffered.length===0)return;let P=Mt(i.currentTime,m.buffered.start(0),m.buffered.end(m.buffered.length-1));if(P.seekTo!==void 0)i.currentTime=P.seekTo;if(P.removeEnd!==void 0)m.remove(0,P.removeEnd)};return o.onmessage=(k)=>{if(typeof k.data==="string"){let P=JSON.parse(k.data);if(P.type==="mse")m=c.addSourceBuffer(P.value),m.mode="segments",m.addEventListener("updateend",C);else if(P.type==="error")u(P.value);return}v.push(k.data),C()},o.onclose=()=>u("The stream connection closed"),{mode:"mse",close:p}}var Oi=8000,Li=30000;function ue(){if(!window.isSecureContext)return"Talk needs Home Assistant over HTTPS";if(!navigator.mediaDevices?.getUserMedia)return"This browser cannot use the microphone";if(typeof RTCPeerConnection>"u")return"This browser cannot send audio";return}class ze{constructor(e,t){this.getHass=e;this.onUpdate=t;this.pressed=!1}async press(e){if(this.pressed=!0,clearTimeout(this.closeTimer),this.source&&this.source.stream!==e.stream)this.close();this.source=e;try{if(!this.pc)this.onUpdate({phase:"connecting",level:0}),this.connecting??=this.connect(e),await this.connecting;if(!this.pressed)return;this.setMicrophone(!0),this.onUpdate({phase:"talking",level:0}),this.startMeter()}catch(t){this.close(),this.onUpdate({phase:"error",level:0,message:Ni(t)})}}release(){if(this.pressed=!1,this.setMicrophone(!1),this.stopMeter(),this.pc)this.onUpdate({phase:"idle",level:0});clearTimeout(this.closeTimer),this.closeTimer=setTimeout(()=>this.close(),Li)}close(){clearTimeout(this.closeTimer),this.stopMeter(),this.pc?.close(),this.ws?.close();for(let e of this.microphone?.getTracks()??[])e.stop();this.audio?.close().catch(()=>{return}),this.pc=void 0,this.ws=void 0,this.microphone=void 0,this.audio=void 0,this.connecting=void 0}async connect(e){let t=ue();if(t)throw Error(t);let i=this.getHass(),[s,r,n]=await Promise.all([navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),ne(i,e.iceEntityId),Z(i,e)]);this.microphone=s,this.ws=n;let o=new RTCPeerConnection({iceServers:r});this.pc=o;for(let c of s.getAudioTracks())c.enabled=!1,o.addTransceiver(c,{direction:"sendonly"});await he(n,o),await pe(o,Oi),o.onconnectionstatechange=()=>{if(o.connectionState==="failed"||o.connectionState==="closed")this.close(),this.onUpdate({phase:"idle",level:0})}}setMicrophone(e){for(let t of this.microphone?.getAudioTracks()??[])t.enabled=e}startMeter(){let e=this.microphone;if(!e||this.meterFrame!==void 0)return;this.audio??=new AudioContext;let t=this.audio.createAnalyser();t.fftSize=512,this.audio.createMediaStreamSource(e).connect(t);let i=new Uint8Array(t.fftSize),s=()=>{t.getByteTimeDomainData(i);let r=0;for(let n of i)r=Math.max(r,Math.abs(n-128));this.onUpdate({phase:"talking",level:Math.min(1,r/64)}),this.meterFrame=requestAnimationFrame(s)};this.meterFrame=requestAnimationFrame(s)}stopMeter(){if(this.meterFrame!==void 0)cancelAnimationFrame(this.meterFrame);this.meterFrame=void 0}}function Ni(e){let t=e.name;if(t==="NotAllowedError")return"Allow the microphone for Home Assistant to talk";if(t==="NotFoundError")return"No microphone found";return e instanceof Error?e.message:String(e)}async function Rt(e,t,i){let s=await e.callWS({type:"frigate/ptz/info",instance_id:t,camera:i}),r=typeof s==="string"?JSON.parse(s):s;return{features:r.features??[],presets:r.presets??[]}}function me(e,t,i,s=""){return e.callService("frigate","ptz",{action:i,argument:s},{entity_id:t})}var Ui=[{move:"up",icon:"mdi:chevron-up",label:"Tilt up"},{move:"left",icon:"mdi:chevron-left",label:"Pan left"},{move:"right",icon:"mdi:chevron-right",label:"Pan right"},{move:"down",icon:"mdi:chevron-down",label:"Tilt down"}];class At extends g{static properties={hass:{attribute:!1},camera:{attribute:!1},info:{state:!0},moving:{state:!0}};willUpdate(e){let t=e.get("camera");if(e.has("camera")&&t?.entity_id!==this.camera.entity_id)this.info=void 0,Rt(this.hass,this.camera.instance_id,this.camera.frigate_name).then((i)=>this.info=i,()=>this.info={features:["pt"],presets:[]})}disconnectedCallback(){if(super.disconnectedCallback(),this.moving)this.stop()}start(e,t,i){e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),this.moving=`${t}-${i}`,me(this.hass,this.camera.entity_id,t,i)}stop(e){if(e?.stopPropagation(),!this.moving)return;this.moving=void 0,me(this.hass,this.camera.entity_id,"stop")}holdButton(e,t,i,s,r=""){return a`<button
      class="hold ${r} ${this.moving===`${e}-${t}`?"pressed":""}"
      aria-label=${s}
      @pointerdown=${(n)=>this.start(n,e,t)}
      @pointerup=${(n)=>this.stop(n)}
      @pointercancel=${(n)=>this.stop(n)}
      @contextmenu=${(n)=>n.preventDefault()}
      @click=${(n)=>n.stopPropagation()}
    >
      <ha-icon icon=${i}></ha-icon>
    </button>`}goToPreset(e,t){e.stopPropagation(),me(this.hass,this.camera.entity_id,"preset",t)}render(){let e=this.info?.features.includes("zoom")??!1,t=this.info?.presets??[],i=t.find((r)=>r.toLowerCase()==="home"),s=t.filter((r)=>r!==i);return a`
      <div class="pad" @pointerdown=${(r)=>r.stopPropagation()}>
        <div class="dpad">
          ${Ui.map((r)=>this.holdButton("move",r.move,r.icon,r.label,r.move))}
          ${i?a`<button
                class="home"
                aria-label="Go to the home position"
                @click=${(r)=>this.goToPreset(r,i)}
              >
                <ha-icon icon="mdi:home"></ha-icon>
              </button>`:l}
        </div>
        ${e?a`<div class="zoom">
              ${this.holdButton("zoom","in","mdi:plus","Zoom in")}
              ${this.holdButton("zoom","out","mdi:minus","Zoom out")}
            </div>`:l}
        ${s.length?a`<div class="presets">
              ${s.map((r)=>a`<button class="preset" @click=${(n)=>this.goToPreset(n,r)}>
                  <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
                  ${r}
                </button>`)}
            </div>`:l}
      </div>
    `}static styles=[y,b`
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
    `]}customElements.define("camera-hub-ptz-pad",At);var He=1800;class Ot extends g{static properties={start:{attribute:!1},end:{attribute:!1},markers:{attribute:!1},position:{attribute:!1},hover:{state:!0}};constructor(){super();this.markers=[]}fraction(e){return Math.min(1,Math.max(0,(e-this.start)/(this.end-this.start)))}timeAt(e){let t=this.renderRoot.querySelector(".track").getBoundingClientRect(),i=Math.min(1,Math.max(0,(e.clientX-t.left)/t.width));return this.start+i*(this.end-this.start)}onPointerDown(e){e.stopPropagation(),e.currentTarget.setPointerCapture(e.pointerId),this.hover=this.timeAt(e)}onPointerMove(e){if(this.hover!==void 0)this.hover=this.timeAt(e)}onPointerUp(e){if(this.hover===void 0)return;let t=this.timeAt(e);this.hover=void 0,this.dispatchEvent(new CustomEvent("timeline-seek",{detail:t,bubbles:!0,composed:!0}))}clock(e,t=!1){return new Date(e*1000).toLocaleTimeString([],{hour:"numeric",minute:"2-digit",...t?{second:"2-digit"}:{}})}render(){let e=[];for(let i=Math.ceil(this.start/He)*He;i<this.end;i+=He)e.push(i);let t=this.hover??this.position;return a`
      <div
        class="track"
        @pointerdown=${this.onPointerDown}
        @pointermove=${this.onPointerMove}
        @pointerup=${this.onPointerUp}
        @pointercancel=${()=>this.hover=void 0}
        @click=${(i)=>i.stopPropagation()}
      >
        ${e.map((i)=>a`
            <span class="tick" style="left: ${this.fraction(i)*100}%">
              ${this.fraction(i)<0.9?a`<span class="tick-label">${this.clock(i)}</span>`:l}
            </span>
          `)}
        ${this.markers.map((i)=>a`<span
            class="marker"
            style="left: ${this.fraction(i.time)*100}%"
            title=${i.label}
          ></span>`)}
        <span class="now-label">Now</span>
        ${t!==void 0?a`
              <span class="needle" style="left: ${this.fraction(t)*100}%">
                <span class="needle-label">${this.clock(t,!0)}</span>
              </span>
            `:l}
      </div>
    `}static styles=[y,b`
      :host {
        display: block;
        padding: 26px 18px 10px;
      }
      .track {
        position: relative;
        height: 40px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.12);
        cursor: pointer;
        touch-action: none;
        -webkit-backdrop-filter: blur(8px);
        backdrop-filter: blur(8px);
      }
      .tick {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(255, 255, 255, 0.25);
      }
      .tick-label,
      .now-label {
        position: absolute;
        top: -20px;
        transform: translateX(-50%);
        font-size: 11px;
        color: var(--ch-text-secondary);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .now-label {
        right: 0;
        transform: none;
      }
      .marker {
        position: absolute;
        top: 8px;
        bottom: 8px;
        width: 4px;
        margin-left: -2px;
        border-radius: 2px;
        background: var(--ch-amber);
      }
      .needle {
        position: absolute;
        top: -4px;
        bottom: -4px;
        width: 3px;
        margin-left: -1.5px;
        border-radius: 2px;
        background: var(--ch-text);
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);
      }
      .needle-label {
        position: absolute;
        bottom: calc(100% + 4px);
        left: 50%;
        transform: translateX(-50%);
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--ch-text);
        color: var(--ch-bg);
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
    `]}customElements.define("camera-hub-timeline",Ot);var Lt=180,Di=4000,Ii=10800,zi=1800,Hi=15;class Nt extends g{static properties={hass:{attribute:!1},camera:{attribute:!1},snapshotRefresh:{attribute:!1},reviews:{attribute:!1},statuses:{state:!0},shown:{state:!0},playback:{state:!0},vodState:{state:!0},vodMessage:{state:!0},muted:{state:!0},paused:{state:!0},position:{state:!0},duration:{state:!0},rate:{state:!0},rewinding:{state:!0},controlsVisible:{state:!0},fullscreen:{state:!0},now:{state:!0},talkUpdate:{state:!0},ptzOpen:{state:!0}};constructor(){super();this.talk=new ze(()=>this.hass,(e)=>this.talkUpdate=e);this.players=[];this.target=0;this.onVisibilityChange=()=>{if(document.hidden)this.stopLive(),this.vodVideo?.pause();else if(!this.playback)this.startLive()};this.onFullscreenChange=()=>{this.fullscreen=document.fullscreenElement===this.frame};this.reviews=[],this.statuses=[{state:"connecting"},{state:"connecting"}],this.shown=0,this.vodState="loading",this.muted=!0,this.paused=!1,this.position=0,this.duration=0,this.rate=1,this.rewinding=!1,this.controlsVisible=!1,this.fullscreen=!1,this.now=Date.now()/1000,this.talkUpdate={phase:"idle",level:0},this.ptzOpen=!1}get frame(){return this.renderRoot.querySelector(".frame")}get vodVideo(){return this.renderRoot.querySelector("video.vod")}connectedCallback(){if(super.connectedCallback(),document.addEventListener("visibilitychange",this.onVisibilityChange),document.addEventListener("fullscreenchange",this.onFullscreenChange),this.clock=setInterval(()=>this.now=Date.now()/1000,30000),this.players.length&&!this.playback)this.startLive()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("visibilitychange",this.onVisibilityChange),document.removeEventListener("fullscreenchange",this.onFullscreenChange),clearInterval(this.clock),clearTimeout(this.hideTimer),this.stopLive(),this.closeVod(),this.talk.close()}firstUpdated(){let e=[...this.renderRoot.querySelectorAll("video.live")];this.players=e.map((i,s)=>new Ie(()=>this.hass,i,(r)=>this.onStatus(s,r)));let t=this.vodVideo;t.addEventListener("timeupdate",()=>this.position=t.currentTime),t.addEventListener("durationchange",()=>this.duration=t.duration||0),t.addEventListener("play",()=>this.paused=!1),t.addEventListener("pause",()=>this.paused=!0),t.addEventListener("ended",()=>this.onPlaybackEnded()),this.startLive()}updated(e){let t=e.get("camera");if(e.has("camera")&&t&&t.entity_id!==this.camera?.entity_id){if(this.playback)this.goLive();else this.switchCamera();this.rewinding=!1,this.ptzOpen=!1,this.talk.close(),this.talkUpdate={phase:"idle",level:0}}for(let i of this.renderRoot.querySelectorAll("video"))i.muted=this.muted}showControls(){this.controlsVisible=!0,clearTimeout(this.hideTimer),this.hideTimer=setTimeout(()=>{if(!(this.rewinding||this.ptzOpen||this.talkUpdate.phase!=="idle"||this.playback&&this.paused))this.controlsVisible=!1},Di)}onStatus(e,t){let i=[...this.statuses];if(i[e]=t,this.statuses=i,e===this.target&&t.state==="playing"&&this.shown!==e){let s=this.shown;this.shown=e,setTimeout(()=>{if(this.target!==s)this.players[s]?.stop()},Lt+50)}}source(){if(!this.camera)return;return{instanceId:this.camera.instance_id,stream:this.camera.stream,iceEntityId:this.camera.entity_id}}startLive(){let e=this.source();if(!e||document.hidden)return;this.target=this.shown,this.players[this.target]?.play(e)}switchCamera(){let e=this.source();if(!e||document.hidden)return;if(this.statuses[this.shown].state!=="playing"){this.startLive();return}this.target=this.shown===0?1:0,this.players[this.target]?.play(e)}stopLive(){for(let e of this.players)e.stop();this.statuses=[{state:"connecting"},{state:"connecting"}]}rewindTo(e){let t=this.camera,i=this.vodVideo;if(!t||!i)return;let s=Date.now()/1000-Hi;if(e>=s-5){this.goLive();return}let r=Math.floor(e-5),n=Math.floor(Math.min(s,e+zi));this.stopLive(),this.closeVod(),this.playback={windowStart:r,windowEnd:n},this.position=e-r,this.duration=n-r,i.playbackRate=this.rate;let o=new J(i,(d,f)=>{this.vodState=d,this.vodMessage=f});this.vod=o;let c=Ae(t.instance_id,t.frigate_name,r,n);D.get(this.hass,c).then((d)=>{if(this.vod===o)o.load(d,e-r)},(d)=>{this.vodState="error",this.vodMessage=d.message??String(d)})}onPlaybackEnded(){let e=this.playback;if(!e)return;this.rewindTo(e.windowEnd)}goLive(){this.closeVod(),this.playback=void 0,this.rate=1,this.startLive()}closeVod(){this.vod?.close(),this.vod=void 0}onControl(e){this.showControls();let t=this.vodVideo,i=e.detail;switch(i.action){case"mute":this.muted=!0;break;case"unmute":this.muted=!1;break;case"play":t?.play();break;case"pause":t?.pause();break;case"seek":if(t)t.currentTime=i.seconds;break;case"skip":if(t)t.currentTime=Math.max(0,t.currentTime+i.seconds);break;case"rate":if(this.rate=i.rate,t)t.playbackRate=i.rate;break;case"rewind":this.rewinding=!this.rewinding,this.now=Date.now()/1000;break;case"live":this.goLive();break;case"fullscreen":this.toggleFullscreen();break;case"talk-start":{let s=this.source(),r=ue();if(clearTimeout(this.talkErrorTimer),r)this.talkUpdate={phase:"error",level:0,message:r};else if(s)this.talk.press(s);break}case"talk-stop":if(this.talk.release(),this.talkUpdate.phase==="error")this.talkErrorTimer=setTimeout(()=>this.talkUpdate={phase:"idle",level:0},4000);break;case"ptz":this.ptzOpen=!this.ptzOpen;break}}async toggleFullscreen(){let e=this.frame;if(!e)return;if(document.fullscreenElement)await document.exitFullscreen();else if(e.requestFullscreen)await e.requestFullscreen();else(this.playback?this.vodVideo:this.renderRoot.querySelectorAll("video.live")[this.shown])?.webkitEnterFullscreen?.()}talkState(){if(!this.camera?.talk)return;let e=ue();return{available:!e,active:this.talkUpdate.phase==="talking"||this.talkUpdate.phase==="connecting",reason:e}}renderTalkBanner(){let{phase:e,level:t,message:i}=this.talkUpdate;if(e==="idle")return l;if(e==="error")return a`<div class="talk-banner error"><ha-icon icon="mdi:microphone-off"></ha-icon>${i}</div>`;return a`
      <div class="talk-banner">
        <ha-icon icon="mdi:microphone"></ha-icon>
        <span>${e==="connecting"?"Connecting microphone…":"Talking"}</span>
        <span class="meter" aria-hidden="true">
          ${[0.15,0.35,0.55,0.75,0.9].map((r)=>a`<span class="bar ${t>=r?"lit":""}"></span>`)}
        </span>
        <span class="hint">Release to stop</span>
      </div>
    `}timelineMarkers(){let e=this.camera;if(!e)return[];return this.reviews.filter((t)=>t.camera===e.frigate_name).map((t)=>({time:t.start_time,label:H(t)}))}render(){let e=this.camera,t=this.statuses[this.target],i=!this.playback,s=i?t.state==="playing":this.vodState==="ready",r=e?le(this.hass,e.entity_id):!1,n=e&&!r&&i?ce(this.hass,e.entity_id,this.snapshotRefresh):void 0,o=this.playback?new Date((this.playback.windowStart+this.position)*1000).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):void 0,c=r?"This camera is offline.":i&&t.state==="retrying"?`${t.reason}. Trying again in ${t.inSeconds} s.`:!i&&this.vodState==="error"?this.vodMessage:void 0,d=this.controlsVisible||this.rewinding||this.ptzOpen||this.talkUpdate.phase!=="idle"||!i&&this.paused;return a`
      <div class="frame" @pointerdown=${()=>this.showControls()}>
        <video class="live ${i&&this.shown===0?"on":""}" muted playsinline autoplay></video>
        <video class="live ${i&&this.shown===1?"on":""}" muted playsinline autoplay></video>
        <video class="vod ${i?"":"on"}" muted playsinline></video>
        ${n?a`<img class="snapshot ${s?"faded":""}" src=${n} alt="" />`:l}
        <div class="shade top"></div>
        <div class="overlay top">
          ${i?a`<span class="badge ${s?"live":""}">
                <span class="dot"></span>${s?"Live":r?"Offline":"Connecting"}
              </span>`:a`<span class="badge recording"><ha-icon icon="mdi:history"></ha-icon>${o}</span>`}
          <span class="name">${e?.name??""}</span>
        </div>
        ${c?a`<div class="message">${c}</div>`:l}
        ${this.renderTalkBanner()}
        ${i&&this.ptzOpen&&e?.ptz?a`<camera-hub-ptz-pad class="ptz" .hass=${this.hass} .camera=${e}></camera-hub-ptz-pad>`:l}
        ${!s&&!r&&!c?a`<div class="spinner ${n?"corner":""}"></div>`:l}
        <div class="chrome ${d?"visible":""}" @control=${this.onControl}>
          <div class="shade bottom"></div>
          ${this.rewinding?a`<camera-hub-timeline
                .start=${this.now-Ii}
                .end=${this.now}
                .markers=${this.timelineMarkers()}
                .position=${this.playback?this.playback.windowStart+this.position:void 0}
                @timeline-seek=${(f)=>{this.showControls(),this.rewindTo(f.detail)}}
              ></camera-hub-timeline>`:l}
          <camera-hub-player-controls
            .mode=${i?"live":"playback"}
            .paused=${this.paused}
            .muted=${this.muted}
            .position=${this.position}
            .duration=${this.duration}
            .clockStart=${this.playback?.windowStart}
            .rate=${this.rate}
            .fullscreen=${this.fullscreen}
            .rewinding=${this.rewinding}
            .talk=${i?this.talkState():void 0}
            .ptz=${i&&(e?.ptz??!1)}
            .ptzOpen=${this.ptzOpen}
          ></camera-hub-player-controls>
        </div>
      </div>
    `}static styles=[y,ae,b`
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
        transition: opacity ${Lt}ms ease;
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
      .talk-banner {
        position: absolute;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
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
        animation: ch-drop 150ms ease;
        --mdc-icon-size: 22px;
        z-index: 2;
      }
      .talk-banner.error {
        background: var(--ch-amber);
        color: #000;
        font-size: 14px;
      }
      .talk-banner .hint {
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
      .meter .bar {
        width: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.35);
      }
      .meter .bar:nth-child(1) {
        height: 6px;
      }
      .meter .bar:nth-child(2) {
        height: 9px;
      }
      .meter .bar:nth-child(3) {
        height: 12px;
      }
      .meter .bar:nth-child(4) {
        height: 15px;
      }
      .meter .bar:nth-child(5) {
        height: 18px;
      }
      .meter .bar.lit {
        background: #fff;
      }
      .ptz {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
      }
      @keyframes ch-drop {
        from {
          opacity: 0;
          transform: translate(-50%, -8px);
        }
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
    `]}customElements.define("camera-hub-main-view",Nt);var Vi=[{minutes:15,label:"15m"},{minutes:30,label:"30m"},{minutes:60,label:"1h"},{minutes:120,label:"2h"}],Ve="all";class Ut extends g{static properties={hass:{attribute:!1},zones:{attribute:!1},open:{state:!0},now:{state:!0}};constructor(){super();this.zones=[],this.now=Date.now()}connectedCallback(){super.connectedCallback(),this.clock=setInterval(()=>this.now=Date.now(),15000)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.clock)}pausedUntil(e){if((e.switch_entity?this.hass.states[e.switch_entity]?.state:void 0)!=="off")return;let i=e.paused_until_entity?Date.parse(this.hass.states[e.paused_until_entity]?.state??""):Number.NaN;return Number.isNaN(i)?void 0:i}remaining(e){let t=Math.max(1,Math.ceil((e-this.now)/60000));if(t<60)return`${t}m`;let i=Math.floor(t/60),s=t%60;return s?`${i}h ${s}m`:`${i}h`}call(e,t,i){this.hass.callService("camera_hub",e,i?{zone:t,minutes:i}:{zone:t}),this.open=void 0}render(){let e=this.zones.filter((s)=>s.notify);if(e.length===0)return l;let t=e.find((s)=>s.id===this.open),i=e.some((s)=>this.pausedUntil(s)!==void 0);return a`
      <div class="row">
        <span class="title">Phone alerts</span>
        <div class="chips">
          ${e.map((s)=>{let r=this.pausedUntil(s);return a`
              <button
                class="chip ${r?"paused":""} ${this.open===s.id?"open":""}"
                @click=${()=>this.open=this.open===s.id?void 0:s.id}
              >
                <ha-icon icon=${r?"mdi:bell-sleep":"mdi:bell-ring-outline"}></ha-icon>
                ${s.name}
                <span class="state">${r?`Paused · ${this.remaining(r)}`:"On"}</span>
              </button>
            `})}
          ${e.length>1?a`<button
                class="chip ${this.open===Ve?"open":""}"
                @click=${()=>this.open=this.open===Ve?void 0:Ve}
              >
                All
              </button>`:l}
        </div>
      </div>
      ${this.open?a`
            <div class="row options">
              <span class="title">
                ${t?`Pause ${t.name}`:"Pause all zones"}
              </span>
              <div class="chips">
                ${Vi.map((s)=>a`<button
                    class="chip"
                    @click=${()=>this.call("pause_zone",this.open,s.minutes)}
                  >
                    ${s.label}
                  </button>`)}
                ${(t?this.pausedUntil(t):i)?a`<button class="chip resume" @click=${()=>this.call("resume_zone",this.open)}>
                      <ha-icon icon="mdi:bell-ring-outline"></ha-icon>Resume
                    </button>`:l}
              </div>
            </div>
          `:l}
    `}static styles=[y,b`
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
    `]}customElements.define("camera-hub-pause-bar",Ut);class Dt extends g{static properties={hass:{attribute:!1},cameras:{attribute:!1},selected:{attribute:!1},refresh:{attribute:!1}};constructor(){super();this.cameras=[],this.refresh=0}select(e){this.dispatchEvent(new CustomEvent("camera-select",{detail:e,bubbles:!0,composed:!0}))}render(){return a`
      <div class="rail">
        ${this.cameras.map((e)=>{let t=le(this.hass,e.entity_id),i=t?void 0:ce(this.hass,e.entity_id,this.refresh);return a`
            <button
              class="tile ${e.entity_id===this.selected?"selected":""}"
              @click=${()=>this.select(e.entity_id)}
            >
              <span class="name">${e.name}</span>
              <span class="image">
                ${i?a`<img src=${i} alt="" loading="lazy" />`:a`<span class="offline">${t?"Offline":""}</span>`}
              </span>
            </button>
          `})}
      </div>
    `}static styles=[y,b`
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
    `]}customElements.define("camera-hub-tile-rail",Dt);var Fi=1e4;function Bi(e){let t=`camera-hub-reloaded-for-${e}`;try{if(sessionStorage.getItem(t))return console.warn(`Camera Hub: the card is 0.4.0, the integration is ${e}.`),!1;sessionStorage.setItem(t,"1")}catch{return!1}return location.reload(),!0}class It extends g{static properties={hass:{attribute:!1},load:{state:!0},selected:{state:!0},snapshotRefresh:{state:!0},openClip:{state:!0},reviewsRevision:{state:!0}};constructor(){super();this.cardConfig={type:"custom:camera-hub-card"};this.loadStarted=!1;this.idle=new Me(()=>this.selectDefault());this.reviewStore=new Le;this.onVisibilityChange=()=>{if(clearInterval(this.snapshotTimer),!document.hidden)this.refreshSnapshots()};this.load={state:"loading"},this.snapshotRefresh=Date.now(),this.reviewsRevision=0,this.reviewStore.onChange(()=>this.reviewsRevision++),this.addEventListener("pointerdown",()=>this.idle.restart(),{capture:!0}),this.addEventListener("camera-select",(e)=>{this.selected=e.detail}),this.addEventListener("clip-open",(e)=>this.onClipOpen(e.detail)),this.addEventListener("clip-close",()=>this.openClip=void 0)}setConfig(e){this.cardConfig=e}getCardSize(){return 8}connectedCallback(){if(super.connectedCallback(),document.addEventListener("visibilitychange",this.onVisibilityChange),this.refreshSnapshots(),this.load.state==="ready")this.idle.restart()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("visibilitychange",this.onVisibilityChange),clearInterval(this.snapshotTimer),this.idle.stop(),this.reviewStore.stop(),this.loadStarted=!1}refreshSnapshots(){this.snapshotRefresh=Date.now(),clearInterval(this.snapshotTimer),this.snapshotTimer=setInterval(()=>this.snapshotRefresh=Date.now(),Fi)}updated(){if(this.hass&&!this.loadStarted)this.loadStarted=!0,this.loadConfig()}async loadConfig(){try{let e=await ut(this.hass);if(e.version!=="0.4.0"&&Bi(e.version))return;this.load={state:"ready",config:e};let t=e.cameras[0]?.instance_id;if(t)this.reviewStore.start(this.hass,t,e.cameras.map((i)=>i.frigate_name));this.selectDefault(),this.idle.setTimeout(e.return_after_seconds)}catch(e){let t=e.message??String(e);this.load={state:"error",message:t}}}defaultCamera(e){let t=this.cardConfig.main_camera??e.default_camera;return e.cameras.find((i)=>i.entity_id===t)??e.cameras[0]}onClipOpen(e){if(e.end_time!==null){this.openClip=e;return}let t=this.cameraByFrigateName(e.camera);if(t)this.selected=t.entity_id}cameraByFrigateName(e){if(this.load.state!=="ready")return;return this.load.config.cameras.find((t)=>t.frigate_name===e)}selectDefault(){if(this.load.state==="ready")this.selected=this.defaultCamera(this.load.config)?.entity_id}render(){if(this.load.state==="loading")return a`<div class="notice">Loading cameras…</div>`;if(this.load.state==="error")return a`<div class="notice">Camera Hub is not available: ${this.load.message}</div>`;let{cameras:e}=this.load.config,t=e.find((i)=>i.entity_id===this.selected);return a`
      <div class="layout">
        <camera-hub-main-view
          .hass=${this.hass}
          .camera=${t}
          .snapshotRefresh=${this.snapshotRefresh}
          .reviews=${this.reviewStore.reviews}
        ></camera-hub-main-view>
        <camera-hub-tile-rail
          .hass=${this.hass}
          .cameras=${e}
          .selected=${this.selected}
          .refresh=${this.snapshotRefresh}
        ></camera-hub-tile-rail>
        <camera-hub-pause-bar .hass=${this.hass} .zones=${this.load.config.zones??[]}></camera-hub-pause-bar>
        <camera-hub-clips-strip
          .hass=${this.hass}
          .cameras=${e}
          .store=${this.reviewStore}
        ></camera-hub-clips-strip>
      </div>
      ${this.openClip?a`<camera-hub-clip-modal
            .hass=${this.hass}
            .review=${this.openClip}
            .instanceId=${e[0]?.instance_id??""}
            .cameraName=${this.cameraByFrigateName(this.openClip.camera)?.name??this.openClip.camera}
          ></camera-hub-clip-modal>`:l}
    `}static styles=[y,b`
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
      camera-hub-tile-rail {
        grid-area: rail;
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
      .notice {
        padding: 24px;
        color: var(--ch-text-secondary);
      }
    `]}customElements.define("camera-hub-card",It);var zt=window;zt.customCards??=[];zt.customCards.push({type:"camera-hub-card",name:"Camera Hub",description:"Live cameras, clips and alerts from Frigate."});console.info("Camera Hub card 0.4.0");export{It as CameraHubCard};
