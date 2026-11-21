var Y=globalThis,te=Y.ShadowRoot&&(Y.ShadyCSS===void 0||Y.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,se=Symbol(),be=new WeakMap;class ie{constructor(e,t,s){if(this._$cssResult$=!0,s!==se)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this._strings=t}get styleSheet(){let e=this._styleSheet,t=this._strings;if(te&&e===void 0){let s=t!==void 0&&t.length===1;if(s)e=be.get(t);if(e===void 0){if((this._styleSheet=e=new CSSStyleSheet).replaceSync(this.cssText),s)be.set(t,e)}}return e}toString(){return this.cssText}}var tt=(e)=>{if(e._$cssResult$===!0)return e.cssText;else if(typeof e==="number")return e;else throw Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)},st=(e)=>new ie(typeof e==="string"?e:String(e),void 0,se),A=(e,...t)=>{let s=e.length===1?e[0]:t.reduce((i,n,o)=>i+tt(n)+e[o+1],e[0]);return new ie(s,e,se)},ve=(e,t)=>{if(te)e.adoptedStyleSheets=t.map((s)=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(let s of t){let i=document.createElement("style"),n=Y.litNonce;if(n!==void 0)i.setAttribute("nonce",n);i.textContent=s.cssText,e.appendChild(i)}},it=(e)=>{let t="";for(let s of e.cssRules)t+=s.cssText;return st(t)},ne=te?(e)=>e:(e)=>e instanceof CSSStyleSheet?it(e):e;var{is:nt,defineProperty:rt,getOwnPropertyDescriptor:Se,getOwnPropertyNames:ot,getOwnPropertySymbols:at,getPrototypeOf:Ee}=Object,ct=!1,_=globalThis;if(ct)_.customElements??=customElements;var y=!0,w,we=_.trustedTypes,dt=we?we.emptyScript:"",xe=y?_.reactiveElementPolyfillSupportDevMode:_.reactiveElementPolyfillSupport;if(y)_.litIssuedWarnings??=new Set,w=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!_.litIssuedWarnings.has(t)&&!_.litIssuedWarnings.has(e))console.warn(t),_.litIssuedWarnings.add(t)},queueMicrotask(()=>{if(w("dev-mode","Lit is in dev mode. Not recommended for production!"),_.ShadyDOM?.inUse&&xe===void 0)w("polyfill-support-missing","Shadow DOM is being polyfilled via `ShadyDOM` but the `polyfill-support` module has not been loaded.")});var lt=y?(e)=>{if(!_.emitLitDebugLogEvents)return;_.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))}:void 0,V=(e,t)=>e,re={toAttribute(e,t){switch(t){case Boolean:e=e?dt:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e);break}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=e!==null;break;case Number:s=e===null?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch(i){s=null}break}return s}},Ce=(e,t)=>!nt(e,t),$e={attribute:!0,type:String,converter:re,reflect:!1,useDefault:!1,hasChanged:Ce};Symbol.metadata??=Symbol("metadata");_.litPropertyMetadata??=new WeakMap;class b extends HTMLElement{static addInitializer(e){this.__prepare(),(this._initializers??=[]).push(e)}static get observedAttributes(){return this.finalize(),this.__attributeToPropertyMap&&[...this.__attributeToPropertyMap.keys()]}static createProperty(e,t=$e){if(t.state)t.attribute=!1;if(this.__prepare(),this.prototype.hasOwnProperty(e))t=Object.create(t),t.wrapped=!0;if(this.elementProperties.set(e,t),!t.noAccessor){let s=y?Symbol.for(`${String(e)} (@property() cache)`):Symbol(),i=this.getPropertyDescriptor(e,s,t);if(i!==void 0)rt(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){let{get:i,set:n}=Se(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};if(y&&i==null){if("value"in(Se(this.prototype,e)??{}))throw Error(`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it's actually declared as a value on the prototype. Usually this is due to using @property or @state on a method.`);w("reactive-property-without-getter",`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it does not have a getter. This will be an error in a future version of Lit.`)}return{get:i,set(o){let r=i?.call(this);n?.call(this,o),this.requestUpdate(e,r,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??$e}static __prepare(){if(this.hasOwnProperty(V("elementProperties",this)))return;let e=Ee(this);if(e.finalize(),e._initializers!==void 0)this._initializers=[...e._initializers];this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(V("finalized",this)))return;if(this.finalized=!0,this.__prepare(),this.hasOwnProperty(V("properties",this))){let t=this.properties,s=[...ot(t),...at(t)];for(let i of s)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,i]of t)this.elementProperties.set(s,i)}this.__attributeToPropertyMap=new Map;for(let[t,s]of this.elementProperties){let i=this.__attributeNameForProperty(t,s);if(i!==void 0)this.__attributeToPropertyMap.set(i,t)}if(this.elementStyles=this.finalizeStyles(this.styles),y){if(this.hasOwnProperty("createProperty"))w("no-override-create-property","Overriding ReactiveElement.createProperty() is deprecated. The override will not be called with standard decorators");if(this.hasOwnProperty("getPropertyDescriptor"))w("no-override-get-property-descriptor","Overriding ReactiveElement.getPropertyDescriptor() is deprecated. The override will not be called with standard decorators")}}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let i of s)t.unshift(ne(i))}else if(e!==void 0)t.push(ne(e));return t}static __attributeNameForProperty(e,t){let s=t.attribute;return s===!1?void 0:typeof s==="string"?s:typeof e==="string"?e.toLowerCase():void 0}constructor(){super();this.__instanceProperties=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.__reflectingProperty=null,this.__initialize()}__initialize(){this.__updatePromise=new Promise((e)=>this.enableUpdating=e),this._$changedProperties=new Map,this.__saveInstanceProperties(),this.requestUpdate(),this.constructor._initializers?.forEach((e)=>e(this))}addController(e){if((this.__controllers??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected)e.hostConnected?.()}removeController(e){this.__controllers?.delete(e)}__saveInstanceProperties(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())if(this.hasOwnProperty(s))e.set(s,this[s]),delete this[s];if(e.size>0)this.__instanceProperties=e}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ve(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this.__controllers?.forEach((e)=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this.__controllers?.forEach((e)=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$attributeToProperty(e,s)}__propertyToAttribute(e,t){let i=this.constructor.elementProperties.get(e),n=this.constructor.__attributeNameForProperty(e,i);if(n!==void 0&&i.reflect===!0){let r=(i.converter?.toAttribute!==void 0?i.converter:re).toAttribute(t,i.type);if(y&&this.constructor.enabledWarnings.includes("migration")&&r===void 0)w("undefined-attribute-value",`The attribute value for the ${e} property is undefined on element ${this.localName}. The attribute will be removed, but in the previous version of \`ReactiveElement\`, the attribute would not have changed.`);if(this.__reflectingProperty=e,r==null)this.removeAttribute(n);else this.setAttribute(n,r);this.__reflectingProperty=null}}_$attributeToProperty(e,t){let s=this.constructor,i=s.__attributeToPropertyMap.get(e);if(i!==void 0&&this.__reflectingProperty!==i){let n=s.getPropertyOptions(i),o=typeof n.converter==="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:re;this.__reflectingProperty=i;let r=o.fromAttribute(t,n.type);this[i]=r??this.__defaultValues?.get(i)??r,this.__reflectingProperty=null}}requestUpdate(e,t,s,i=!1,n){if(e!==void 0){if(y&&e instanceof Event)w("","The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()");let o=this.constructor;if(i===!1)n=this[e];if(s??=o.getPropertyOptions(e),(s.hasChanged??Ce)(n,t)||s.useDefault&&s.reflect&&n===this.__defaultValues?.get(e)&&!this.hasAttribute(o.__attributeNameForProperty(e,s)))this._$changeProperty(e,t,s);else return}if(this.isUpdatePending===!1)this.__updatePromise=this.__enqueueUpdate()}_$changeProperty(e,t,{useDefault:s,reflect:i,wrapped:n},o){if(s&&!(this.__defaultValues??=new Map).has(e)){if(this.__defaultValues.set(e,o??t??this[e]),n!==!0||o!==void 0)return}if(!this._$changedProperties.has(e)){if(!this.hasUpdated&&!s)t=void 0;this._$changedProperties.set(e,t)}if(i===!0&&this.__reflectingProperty!==e)(this.__reflectingProperties??=new Set).add(e)}async __enqueueUpdate(){this.isUpdatePending=!0;try{await this.__updatePromise}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();if(e!=null)await e;return!this.isUpdatePending}scheduleUpdate(){let e=this.performUpdate();if(y&&this.constructor.enabledWarnings.includes("async-perform-update")&&typeof e?.then==="function")w("async-perform-update",`Element ${this.localName} returned a Promise from performUpdate(). This behavior is deprecated and will be removed in a future version of ReactiveElement.`);return e}performUpdate(){if(!this.isUpdatePending)return;if(lt?.({kind:"update"}),!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),y){let n=[...this.constructor.elementProperties.keys()].filter((o)=>this.hasOwnProperty(o)&&(o in Ee(this)));if(n.length)throw Error(`The following properties on element ${this.localName} will not trigger updates as expected because they are set using class fields: ${n.join(", ")}. Native class fields and some compiled output will overwrite accessors used for detecting changes. See https://lit.dev/msg/class-field-shadowing for more information.`)}if(this.__instanceProperties){for(let[i,n]of this.__instanceProperties)this[i]=n;this.__instanceProperties=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,n]of s){let{wrapped:o}=n,r=this[i];if(o===!0&&!this._$changedProperties.has(i)&&r!==void 0)this._$changeProperty(i,void 0,n,r)}}let e=!1,t=this._$changedProperties;try{if(e=this.shouldUpdate(t),e)this.willUpdate(t),this.__controllers?.forEach((s)=>s.hostUpdate?.()),this.update(t);else this.__markUpdated()}catch(s){throw e=!1,this.__markUpdated(),s}if(e)this._$didUpdate(t)}willUpdate(e){}_$didUpdate(e){if(this.__controllers?.forEach((t)=>t.hostUpdated?.()),!this.hasUpdated)this.hasUpdated=!0,this.firstUpdated(e);if(this.updated(e),y&&this.isUpdatePending&&this.constructor.enabledWarnings.includes("change-in-update"))w("change-in-update",`Element ${this.localName} scheduled an update (generally because a property was set) after an update completed, causing a new update to be scheduled. This is inefficient and should be avoided unless the next update can only be scheduled as a side effect of the previous update.`)}__markUpdated(){this._$changedProperties=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.__updatePromise}shouldUpdate(e){return!0}update(e){this.__reflectingProperties&&=this.__reflectingProperties.forEach((t)=>this.__propertyToAttribute(t,this[t])),this.__markUpdated()}updated(e){}firstUpdated(e){}}b.elementStyles=[];b.shadowRootOptions={mode:"open"};b[V("elementProperties",b)]=new Map;b[V("finalized",b)]=new Map;xe?.({ReactiveElement:b});if(y){b.enabledWarnings=["change-in-update","async-perform-update"];let e=function(t){if(!t.hasOwnProperty(V("enabledWarnings",t)))t.enabledWarnings=t.enabledWarnings.slice()};b.enableWarning=function(t){if(e(this),!this.enabledWarnings.includes(t))this.enabledWarnings.push(t)},b.disableWarning=function(t){e(this);let s=this.enabledWarnings.indexOf(t);if(s>=0)this.enabledWarnings.splice(s,1)}}(_.reactiveElementVersions??=[]).push("2.1.2");if(y&&_.reactiveElementVersions.length>1)queueMicrotask(()=>{w("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var v=globalThis,d=(e)=>{if(!v.emitLitDebugLogEvents)return;v.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))},ht=0,z;v.litIssuedWarnings??=new Set,z=(e,t)=>{if(t+=e?` See https://lit.dev/msg/${e} for more information.`:"",!v.litIssuedWarnings.has(t)&&!v.litIssuedWarnings.has(e))console.warn(t),v.litIssuedWarnings.add(t)},queueMicrotask(()=>{z("dev-mode","Lit is in dev mode. Not recommended for production!")});var x=v.ShadyDOM?.inUse&&v.ShadyDOM?.noPatch===!0?v.ShadyDOM.wrap:(e)=>e,X=v.trustedTypes,Te=X?X.createPolicy("lit-html",{createHTML:(e)=>e}):void 0,pt=(e)=>e,G=(e,t,s)=>pt,ut=(e)=>{if(D!==G)throw Error("Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.");D=e},mt=()=>{D=G},le=(e,t,s)=>D(e,t,s),Re="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,De="?"+P,ft=`<${De}>`,k=document,W=()=>k.createComment(""),B=(e)=>e===null||typeof e!="object"&&typeof e!="function",he=Array.isArray,gt=(e)=>he(e)||typeof e?.[Symbol.iterator]==="function",oe=`[ 	
\f\r]`,_t=`[^ 	
\f\r"'\`<>=]`,yt=`[^\\s"'>=/]`,I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Pe=1,ae=2,bt=3,Oe=/-->/g,Ae=/>/g,M=new RegExp(`>|${oe}(?:(${yt}+)(${oe}*=${oe}*(?:${_t}|("|')|))|$)`,"g"),vt=0,Me=1,St=2,Ne=3,ce=/'/g,de=/"/g,Ve=/^(?:script|style|textarea|title)$/i,Et=1,K=2,J=3,pe=1,Q=2,wt=3,$t=4,xt=5,ue=6,Ct=7,me=(e)=>(t,...s)=>{if(t.some((i)=>i===void 0))console.warn(`Some template strings are undefined.
This is probably caused by illegal octal escape sequences.`);if(s.some((i)=>i?._$litStatic$))z("",`Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.
Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`);return{["_$litType$"]:e,strings:t,values:s}},g=me(Et),Wt=me(K),Bt=me(J),R=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),ke=new WeakMap,N=k.createTreeWalker(k,129),D=G;function Ue(e,t){if(!he(e)||!e.hasOwnProperty("raw")){let s="invalid template strings array";throw s=`
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
`),Error(s)}return Te!==void 0?Te.createHTML(t):t}var Tt=(e,t)=>{let s=e.length-1,i=[],n=t===K?"<svg>":t===J?"<math>":"",o,r=I;for(let h=0;h<s;h++){let f=e[h],c=-1,m,l=0,p;while(l<f.length){if(r.lastIndex=l,p=r.exec(f),p===null)break;if(l=r.lastIndex,r===I){if(p[Pe]==="!--")r=Oe;else if(p[Pe]!==void 0)r=Ae;else if(p[ae]!==void 0){if(Ve.test(p[ae]))o=new RegExp(`</${p[ae]}`,"g");r=M}else if(p[bt]!==void 0)throw Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions")}else if(r===M)if(p[vt]===">")r=o??I,c=-1;else if(p[Me]===void 0)c=-2;else c=r.lastIndex-p[St].length,m=p[Me],r=p[Ne]===void 0?M:p[Ne]==='"'?de:ce;else if(r===de||r===ce)r=M;else if(r===Oe||r===Ae)r=I;else r=M,o=void 0}console.assert(c===-1||r===M||r===ce||r===de,"unexpected parse state B");let C=r===M&&e[h+1].startsWith("/>")?" ":"";n+=r===I?f+ft:c>=0?(i.push(m),f.slice(0,c)+Re+f.slice(c))+P+C:f+P+(c===-2?h:C)}let a=n+(e[s]||"<?>")+(t===K?"</svg>":t===J?"</math>":"");return[Ue(e,a),i]};class j{constructor({strings:e,["_$litType$"]:t},s){this.parts=[];let i,n=0,o=0,r=e.length-1,a=this.parts,[h,f]=Tt(e,t);if(this.el=j.createElement(h,s),N.currentNode=this.el.content,t===K||t===J){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}while((i=N.nextNode())!==null&&a.length<r){if(i.nodeType===1){{let c=i.localName;if(/^(?:textarea|template)$/i.test(c)&&i.innerHTML.includes(P)){let m=`Expressions are not supported inside \`${c}\` elements. See https://lit.dev/msg/expression-in-${c} for more information.`;if(c==="template")throw Error(m);else z("",m)}}if(i.hasAttributes()){for(let c of i.getAttributeNames())if(c.endsWith(Re)){let m=f[o++],p=i.getAttribute(c).split(P),C=/([.?@])?(.*)/.exec(m);a.push({type:pe,index:n,name:C[2],strings:p,ctor:C[1]==="."?Ie:C[1]==="?"?Le:C[1]==="@"?ze:q}),i.removeAttribute(c)}else if(c.startsWith(P))a.push({type:ue,index:n}),i.removeAttribute(c)}if(Ve.test(i.tagName)){let c=i.textContent.split(P),m=c.length-1;if(m>0){i.textContent=X?X.emptyScript:"";for(let l=0;l<m;l++)i.append(c[l],W()),N.nextNode(),a.push({type:Q,index:++n});i.append(c[m],W())}}}else if(i.nodeType===8)if(i.data===De)a.push({type:Q,index:n});else{let m=-1;while((m=i.data.indexOf(P,m+1))!==-1)a.push({type:Ct,index:n}),m+=P.length-1}n++}if(f.length!==o)throw Error('Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=${true} ?disabled=${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: \n`'+e.join("${...}")+"`");d&&d({kind:"template prep",template:this,clonableTemplate:this.el,parts:this.parts,strings:e})}static createElement(e,t){let s=k.createElement("template");return s.innerHTML=e,s}}function U(e,t,s=e,i){if(t===R)return t;let n=i!==void 0?s.__directives?.[i]:s.__directive,o=B(t)?void 0:t._$litDirective$;if(n?.constructor!==o){if(n?._$notifyDirectiveConnectionChanged?.(!1),o===void 0)n=void 0;else n=new o(e),n._$initialize(e,s,i);if(i!==void 0)(s.__directives??=[])[i]=n;else s.__directive=n}if(n!==void 0)t=U(e,n._$resolve(e,t.values),n,i);return t}class He{constructor(e,t){this._$parts=[],this._$disconnectableChildren=void 0,this._$template=e,this._$parent=t}get parentNode(){return this._$parent.parentNode}get _$isConnected(){return this._$parent._$isConnected}_clone(e){let{el:{content:t},parts:s}=this._$template,i=(e?.creationScope??k).importNode(t,!0);N.currentNode=i;let n=N.nextNode(),o=0,r=0,a=s[0];while(a!==void 0){if(o===a.index){let h;if(a.type===Q)h=new F(n,n.nextSibling,this,e);else if(a.type===pe)h=new a.ctor(n,a.name,a.strings,this,e);else if(a.type===ue)h=new We(n,this,e);this._$parts.push(h),a=s[++r]}if(o!==a?.index)n=N.nextNode(),o++}return N.currentNode=k,i}_update(e){let t=0;for(let s of this._$parts){if(s!==void 0)if(d&&d({kind:"set part",part:s,value:e[t],valueIndex:t,values:e,templateInstance:this}),s.strings!==void 0)s._$setValue(e,s,t),t+=s.strings.length-2;else s._$setValue(e[t]);t++}}}class F{get _$isConnected(){return this._$parent?._$isConnected??this.__isConnected}constructor(e,t,s,i){this.type=Q,this._$committedValue=u,this._$disconnectableChildren=void 0,this._$startNode=e,this._$endNode=t,this._$parent=s,this.options=i,this.__isConnected=i?.isConnected??!0,this._textSanitizer=void 0}get parentNode(){let e=x(this._$startNode).parentNode,t=this._$parent;if(t!==void 0&&e?.nodeType===11)e=t.parentNode;return e}get startNode(){return this._$startNode}get endNode(){return this._$endNode}_$setValue(e,t=this){if(this.parentNode===null)throw Error("This `ChildPart` has no `parentNode` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's `innerHTML` or `textContent` can do this.");if(e=U(this,e,t),B(e)){if(e===u||e==null||e===""){if(this._$committedValue!==u)d&&d({kind:"commit nothing to child",start:this._$startNode,end:this._$endNode,parent:this._$parent,options:this.options}),this._$clear();this._$committedValue=u}else if(e!==this._$committedValue&&e!==R)this._commitText(e)}else if(e._$litType$!==void 0)this._commitTemplateResult(e);else if(e.nodeType!==void 0){if(this.options?.host===e){this._commitText("[probable mistake: rendered a template's host in itself (commonly caused by writing ${this} in a template]"),console.warn("Attempted to render the template host",e,"inside itself. This is almost always a mistake, and in dev mode ","we render some warning text. In production however, we'll ","render it, which will usually result in an error, and sometimes ","in the element disappearing from the DOM.");return}this._commitNode(e)}else if(gt(e))this._commitIterable(e);else this._commitText(e)}_insert(e){return x(x(this._$startNode).parentNode).insertBefore(e,this._$endNode)}_commitNode(e){if(this._$committedValue!==e){if(this._$clear(),D!==G){let t=this._$startNode.parentNode?.nodeName;if(t==="STYLE"||t==="SCRIPT"){let s="Forbidden";if(t==="STYLE")s="Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css`...` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.";else s="Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.";throw Error(s)}}d&&d({kind:"commit node",start:this._$startNode,parent:this._$parent,value:e,options:this.options}),this._$committedValue=this._insert(e)}}_commitText(e){if(this._$committedValue!==u&&B(this._$committedValue)){let t=x(this._$startNode).nextSibling;if(this._textSanitizer===void 0)this._textSanitizer=le(t,"data","property");e=this._textSanitizer(e),d&&d({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}else{let t=k.createTextNode("");if(this._commitNode(t),this._textSanitizer===void 0)this._textSanitizer=le(t,"data","property");e=this._textSanitizer(e),d&&d({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}this._$committedValue=e}_commitTemplateResult(e){let{values:t,["_$litType$"]:s}=e,i=typeof s==="number"?this._$getTemplate(e):(s.el===void 0&&(s.el=j.createElement(Ue(s.h,s.h[0]),this.options)),s);if(this._$committedValue?._$template===i)d&&d({kind:"template updating",template:i,instance:this._$committedValue,parts:this._$committedValue._$parts,options:this.options,values:t}),this._$committedValue._update(t);else{let n=new He(i,this),o=n._clone(this.options);d&&d({kind:"template instantiated",template:i,instance:n,parts:n._$parts,options:this.options,fragment:o,values:t}),n._update(t),d&&d({kind:"template instantiated and updated",template:i,instance:n,parts:n._$parts,options:this.options,fragment:o,values:t}),this._commitNode(o),this._$committedValue=n}}_$getTemplate(e){let t=ke.get(e.strings);if(t===void 0)ke.set(e.strings,t=new j(e));return t}_commitIterable(e){if(!he(this._$committedValue))this._$committedValue=[],this._$clear();let t=this._$committedValue,s=0,i;for(let n of e){if(s===t.length)t.push(i=new F(this._insert(W()),this._insert(W()),this,this.options));else i=t[s];i._$setValue(n),s++}if(s<t.length)this._$clear(i&&x(i._$endNode).nextSibling,s),t.length=s}_$clear(e=x(this._$startNode).nextSibling,t){this._$notifyConnectionChanged?.(!1,!0,t);while(e!==this._$endNode){let s=x(e).nextSibling;x(e).remove(),e=s}}setConnected(e){if(this._$parent===void 0)this.__isConnected=e,this._$notifyConnectionChanged?.(e);else throw Error("part.setConnected() may only be called on a RootPart returned from render().")}}class q{get tagName(){return this.element.tagName}get _$isConnected(){return this._$parent._$isConnected}constructor(e,t,s,i,n){if(this.type=pe,this._$committedValue=u,this._$disconnectableChildren=void 0,this.element=e,this.name=t,this._$parent=i,this.options=n,s.length>2||s[0]!==""||s[1]!=="")this._$committedValue=Array(s.length-1).fill(new String),this.strings=s;else this._$committedValue=u;this._sanitizer=void 0}_$setValue(e,t=this,s,i){let n=this.strings,o=!1;if(n===void 0){if(e=U(this,e,t,0),o=!B(e)||e!==this._$committedValue&&e!==R,o)this._$committedValue=e}else{let r=e;e=n[0];let a,h;for(a=0;a<n.length-1;a++){if(h=U(this,r[s+a],t,a),h===R)h=this._$committedValue[a];if(o||=!B(h)||h!==this._$committedValue[a],h===u)e=u;else if(e!==u)e+=(h??"")+n[a+1];this._$committedValue[a]=h}}if(o&&!i)this._commitValue(e)}_commitValue(e){if(e===u)x(this.element).removeAttribute(this.name);else{if(this._sanitizer===void 0)this._sanitizer=D(this.element,this.name,"attribute");e=this._sanitizer(e??""),d&&d({kind:"commit attribute",element:this.element,name:this.name,value:e,options:this.options}),x(this.element).setAttribute(this.name,e??"")}}}class Ie extends q{constructor(){super(...arguments);this.type=wt}_commitValue(e){if(this._sanitizer===void 0)this._sanitizer=D(this.element,this.name,"property");e=this._sanitizer(e),d&&d({kind:"commit property",element:this.element,name:this.name,value:e,options:this.options}),this.element[this.name]=e===u?void 0:e}}class Le extends q{constructor(){super(...arguments);this.type=$t}_commitValue(e){d&&d({kind:"commit boolean attribute",element:this.element,name:this.name,value:!!(e&&e!==u),options:this.options}),x(this.element).toggleAttribute(this.name,!!e&&e!==u)}}class ze extends q{constructor(e,t,s,i,n){super(e,t,s,i,n);if(this.type=xt,this.strings!==void 0)throw Error(`A \`<${e.localName}>\` has a \`@${t}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`)}_$setValue(e,t=this){if(e=U(this,e,t,0)??u,e===R)return;let s=this._$committedValue,i=e===u&&s!==u||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==u&&(s===u||i);if(d&&d({kind:"commit event listener",element:this.element,name:this.name,value:e,options:this.options,removeListener:i,addListener:n,oldListener:s}),i)this.element.removeEventListener(this.name,this,s);if(n)this.element.addEventListener(this.name,this,e);this._$committedValue=e}handleEvent(e){if(typeof this._$committedValue==="function")this._$committedValue.call(this.options?.host??this.element,e);else this._$committedValue.handleEvent(e)}}class We{constructor(e,t,s){this.element=e,this.type=ue,this._$disconnectableChildren=void 0,this._$parent=t,this.options=s}get _$isConnected(){return this._$parent._$isConnected}_$setValue(e){d&&d({kind:"commit to element binding",element:this.element,value:e,options:this.options}),U(this,e)}}var Pt=v.litHtmlPolyfillSupportDevMode;Pt?.(j,F);(v.litHtmlVersions??=[]).push("3.3.3");if(v.litHtmlVersions.length>1)queueMicrotask(()=>{z("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var L=(e,t,s)=>{if(t==null)throw TypeError(`The container to render into may not be ${t}`);let i=ht++,n=s?.renderBefore??t,o=n._$litPart$;if(d&&d({kind:"begin render",id:i,value:e,container:t,options:s,part:o}),o===void 0){let r=s?.renderBefore??null;n._$litPart$=o=new F(t.insertBefore(W(),r),r,void 0,s??{})}return o._$setValue(e),d&&d({kind:"end render",id:i,value:e,container:t,options:s,part:o}),o};L.setSanitizer=ut,L.createSanitizer=le,L._testOnlyClearSanitizerFactoryDoNotCallOrElse=mt;var Ot=(e,t)=>e,fe=!0,O=globalThis,Be;if(fe)O.litIssuedWarnings??=new Set,Be=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!O.litIssuedWarnings.has(t)&&!O.litIssuedWarnings.has(e))console.warn(t),O.litIssuedWarnings.add(t)};class E extends b{constructor(){super(...arguments);this.renderOptions={host:this},this.__childPart=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();if(!this.hasUpdated)this.renderOptions.isConnected=this.isConnected;super.update(e),this.__childPart=L(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this.__childPart?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this.__childPart?.setConnected(!1)}render(){return R}}E._$litElement$=!0;E[Ot("finalized",E)]=!0;O.litElementHydrateSupport?.({LitElement:E});var At=fe?O.litElementPolyfillSupportDevMode:O.litElementPolyfillSupport;At?.({LitElement:E});(O.litElementVersions??=[]).push("4.2.2");if(fe&&O.litElementVersions.length>1)queueMicrotask(()=>{Be("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});function je(e){return e.callWS({type:"camera_hub/config"})}async function Fe(e,t,s=30){let i=await e.callWS({type:"auth/sign_path",path:t,expires:s});return e.hassUrl(i.path)}async function qe(e,t){return(await e.callWS({type:"camera/webrtc/get_client_config",entity_id:t})).configuration?.iceServers??[]}class ge{constructor(e){this.onIdle=e;this.timeoutMs=0}setTimeout(e){this.timeoutMs=e*1000,this.restart()}restart(){if(clearTimeout(this.timer),this.timeoutMs>0)this.timer=setTimeout(this.onIdle,this.timeoutMs)}stop(){clearTimeout(this.timer)}}var H=A`
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
`;function Z(e,t,s){let i=e.states[t]?.attributes.entity_picture;if(typeof i!=="string")return;let n=i.includes("?")?"&":"?";return e.hassUrl(`${i}${n}t=${s}`)}function ee(e,t){let s=e.states[t]?.state;return s===void 0||s==="unavailable"}var Mt=["avc1.640029","avc1.64002A","avc1.640033","hvc1.1.6.L153.B0","mp4a.40.2","mp4a.40.5","flac","opus"];function Ye(e){return Mt.filter((t)=>e(`video/mp4; codecs="${t}"`)).join()}function Xe(e,t,s){let i={};if(s-e>3)i.seekTo=s-0.5;let n=i.seekTo??e;if(n-t>10)i.removeEnd=n-5;return i}var Nt=5000,kt=30000;class ye{constructor(e,t,s){this.getHass=e;this.video=t;this.onStatus=s;this.attempt=0;this.generation=0;t.muted=!0,t.playsInline=!0,t.autoplay=!0,t.addEventListener("playing",()=>{if(this.session)this.attempt=0,this.onStatus({state:"playing",mode:this.session.mode})})}play(e){this.stop(),this.source=e,this.attempt=0,this.connect()}stop(){this.generation++,clearTimeout(this.retryTimer),this.session?.close(),this.session=void 0,this.source=void 0}async connect(){let e=this.source;if(!e)return;let t=++this.generation,s=()=>t===this.generation,i=(n)=>{if(s())this.retry(n)};this.onStatus({state:"connecting"});try{let n;try{n=await Rt(this.getHass(),e,this.video,i)}catch{if(!s())return;n=await Vt(this.getHass(),e,this.video,i)}if(!s()){n.close();return}this.session=n}catch(n){i(n instanceof Error?n.message:String(n))}}retry(e){this.session?.close(),this.session=void 0;let t=Math.min(kt,1000*2**this.attempt++);this.onStatus({state:"retrying",inSeconds:Math.round(t/1000),reason:e}),this.retryTimer=setTimeout(()=>void this.connect(),t)}}async function Ke(e,t){let s=`/api/frigate/${encodeURIComponent(t.instanceId)}/go2rtc/ws/api/ws?src=${encodeURIComponent(t.stream)}`,i=(await Fe(e,s)).replace(/^http/,"ws"),n=new WebSocket(i);return n.binaryType="arraybuffer",await new Promise((o,r)=>{n.onopen=()=>o(),n.onerror=()=>r(Error("Could not open the stream connection"))}),n.onerror=null,n}function _e(e,t,s){if(e.readyState===WebSocket.OPEN)e.send(JSON.stringify({type:t,value:s}))}async function Rt(e,t,s,i){let[n,o]=await Promise.all([qe(e,t.iceEntityId),Ke(e,t)]),r=new RTCPeerConnection({iceServers:n}),a=!1,h=()=>{if(a=!0,r.close(),o.close(),s.srcObject)s.srcObject=null};r.addTransceiver("video",{direction:"recvonly"}),r.addTransceiver("audio",{direction:"recvonly"});let f=new MediaStream;r.ontrack=(l)=>{if(f.addTrack(l.track),s.srcObject!==f)s.removeAttribute("src"),s.srcObject=f},r.onicecandidate=(l)=>_e(o,"webrtc/candidate",l.candidate?.candidate??""),o.onmessage=(l)=>{if(typeof l.data!=="string")return;let p=JSON.parse(l.data);if(p.type==="webrtc/answer")r.setRemoteDescription({type:"answer",sdp:p.value});else if(p.type==="webrtc/candidate"&&p.value)r.addIceCandidate({candidate:p.value,sdpMid:"0"});else if(p.type==="error")r.close()};let c=await r.createOffer();await r.setLocalDescription(c),_e(o,"webrtc/offer",c.sdp??"");try{await Dt(r,Nt)}catch(l){throw h(),l}let m=(l)=>{if(!a)h(),i(l)};return r.onconnectionstatechange=()=>{if(r.connectionState==="failed"||r.connectionState==="closed")m("The WebRTC connection was lost")},o.onclose=()=>m("The stream connection closed"),{mode:"webrtc",close:h}}function Dt(e,t){return new Promise((s,i)=>{let n=setTimeout(()=>i(Error("WebRTC timed out")),t);e.onconnectionstatechange=()=>{if(e.connectionState==="connected")clearTimeout(n),s();else if(e.connectionState==="failed"||e.connectionState==="closed")clearTimeout(n),i(Error("WebRTC failed"))}})}async function Vt(e,t,s,i){let n=window.ManagedMediaSource,o=n??window.MediaSource;if(!o)throw Error("This browser cannot play the stream");let r=await Ke(e,t),a=new o;if(n)s.disableRemotePlayback=!0;s.srcObject=null;let h=URL.createObjectURL(a);s.src=h;let f=!1,c=()=>{f=!0,r.close(),s.removeAttribute("src"),s.load(),URL.revokeObjectURL(h)},m=(S)=>{if(!f)c(),i(S)};await new Promise((S)=>a.addEventListener("sourceopen",S,{once:!0})),_e(r,"mse",Ye((S)=>o.isTypeSupported(S)));let l,p=[],C=()=>{if(!l||l.updating||f)return;let S=p.shift();if(S){l.appendBuffer(S);return}if(l.buffered.length===0)return;let T=Xe(s.currentTime,l.buffered.start(0),l.buffered.end(l.buffered.length-1));if(T.seekTo!==void 0)s.currentTime=T.seekTo;if(T.removeEnd!==void 0)l.remove(0,T.removeEnd)};return r.onmessage=(S)=>{if(typeof S.data==="string"){let T=JSON.parse(S.data);if(T.type==="mse")l=a.addSourceBuffer(T.value),l.mode="segments",l.addEventListener("updateend",C);else if(T.type==="error")m(T.value);return}p.push(S.data),C()},r.onclose=()=>m("The stream connection closed"),{mode:"mse",close:c}}var Je=180;class Qe extends E{static properties={hass:{attribute:!1},camera:{attribute:!1},statuses:{state:!0},shown:{state:!0}};constructor(){super();this.players=[];this.target=0;this.snapshotTime=Date.now();this.onVisibilityChange=()=>{if(document.hidden)this.stopAll();else this.snapshotTime=Date.now(),this.start()};this.statuses=[{state:"connecting"},{state:"connecting"}],this.shown=0}connectedCallback(){if(super.connectedCallback(),document.addEventListener("visibilitychange",this.onVisibilityChange),this.players.length)this.start()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("visibilitychange",this.onVisibilityChange),this.stopAll()}firstUpdated(){let e=[...this.renderRoot.querySelectorAll("video")];this.players=e.map((t,s)=>new ye(()=>this.hass,t,(i)=>this.onStatus(s,i))),this.start()}updated(e){let t=e.get("camera");if(e.has("camera")&&t&&t.entity_id!==this.camera?.entity_id&&this.players.length)this.snapshotTime=Date.now(),this.switchCamera()}onStatus(e,t){let s=[...this.statuses];if(s[e]=t,this.statuses=s,e===this.target&&t.state==="playing"&&this.shown!==e){let i=this.shown;this.shown=e,setTimeout(()=>{if(this.target!==i)this.players[i]?.stop()},Je+50)}}source(){if(!this.camera)return;return{instanceId:this.camera.instance_id,stream:this.camera.stream,iceEntityId:this.camera.entity_id}}start(){let e=this.source();if(!e||document.hidden)return;this.target=this.shown,this.players[this.target]?.play(e)}switchCamera(){let e=this.source();if(!e||document.hidden)return;if(this.statuses[this.shown].state!=="playing"){this.start();return}this.target=this.shown===0?1:0,this.players[this.target]?.play(e)}stopAll(){for(let e of this.players)e.stop()}render(){let e=this.camera,t=this.statuses[this.target],s=t.state==="playing",i=this.statuses[this.shown].state==="playing",n=e?ee(this.hass,e.entity_id):!1,o=e&&!i?Z(this.hass,e.entity_id,this.snapshotTime):void 0;return g`
      <div class="frame">
        ${o?g`<img class="snapshot" src=${o} alt="" />`:u}
        <video class=${this.shown===0?"on":""} muted playsinline autoplay></video>
        <video class=${this.shown===1?"on":""} muted playsinline autoplay></video>
        <div class="shade top"></div>
        <div class="overlay top">
          <span class="live ${s?"on":""}">
            <span class="dot"></span>${s?"Live":n?"Offline":"Connecting"}
          </span>
          <span class="name">${e?.name??""}</span>
        </div>
        ${n?g`<div class="message">This camera is offline.</div>`:t.state==="retrying"?g`<div class="message">
                ${t.reason}. Trying again in ${t.inSeconds} s.
              </div>`:u}
        ${!s&&!n?g`<div class="spinner"></div>`:u}
      </div>
    `}static styles=[H,A`
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
        opacity: 0;
        transition: opacity ${Je}ms ease;
      }
      video.on {
        opacity: 1;
      }
      .snapshot {
        object-fit: cover;
        filter: blur(8px) brightness(0.6);
        transform: scale(1.05);
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
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `]}customElements.define("camera-hub-main-view",Qe);var Ut=1e4;class Ge extends E{static properties={hass:{attribute:!1},cameras:{attribute:!1},selected:{attribute:!1},refresh:{state:!0}};constructor(){super();this.onVisibilityChange=()=>{if(document.hidden)clearInterval(this.interval);else this.refresh=Date.now(),this.startRefreshing()};this.cameras=[],this.refresh=Date.now()}connectedCallback(){super.connectedCallback(),document.addEventListener("visibilitychange",this.onVisibilityChange),this.startRefreshing()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("visibilitychange",this.onVisibilityChange),clearInterval(this.interval)}startRefreshing(){clearInterval(this.interval),this.interval=setInterval(()=>this.refresh=Date.now(),Ut)}select(e){this.dispatchEvent(new CustomEvent("camera-select",{detail:e,bubbles:!0,composed:!0}))}render(){return g`
      <div class="rail">
        ${this.cameras.map((e)=>{let t=ee(this.hass,e.entity_id),s=t?void 0:Z(this.hass,e.entity_id,this.refresh);return g`
            <button
              class="tile ${e.entity_id===this.selected?"selected":""}"
              @click=${()=>this.select(e.entity_id)}
            >
              <span class="name">${e.name}</span>
              <span class="image">
                ${s?g`<img src=${s} alt="" loading="lazy" />`:g`<span class="offline">${t?"Offline":""}</span>`}
              </span>
            </button>
          `})}
      </div>
    `}static styles=[H,A`
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
    `]}customElements.define("camera-hub-tile-rail",Ge);class Ze extends E{static properties={hass:{attribute:!1},load:{state:!0},selected:{state:!0}};constructor(){super();this.cardConfig={type:"custom:camera-hub-card"};this.loadStarted=!1;this.idle=new ge(()=>this.selectDefault());this.load={state:"loading"},this.addEventListener("pointerdown",()=>this.idle.restart(),{capture:!0}),this.addEventListener("camera-select",(e)=>{this.selected=e.detail})}setConfig(e){this.cardConfig=e}getCardSize(){return 8}disconnectedCallback(){super.disconnectedCallback(),this.idle.stop()}connectedCallback(){if(super.connectedCallback(),this.load.state==="ready")this.idle.restart()}updated(){if(this.hass&&!this.loadStarted)this.loadStarted=!0,this.loadConfig()}async loadConfig(){try{let e=await je(this.hass);if(e.version!=="0.0.2")console.warn(`Camera Hub: the card is 0.0.2 but the integration is ${e.version}. Reload the page to get the new card.`);this.load={state:"ready",config:e},this.selectDefault(),this.idle.setTimeout(e.return_after_seconds)}catch(e){let t=e.message??String(e);this.load={state:"error",message:t}}}defaultCamera(e){let t=this.cardConfig.main_camera??e.default_camera;return e.cameras.find((s)=>s.entity_id===t)??e.cameras[0]}selectDefault(){if(this.load.state==="ready")this.selected=this.defaultCamera(this.load.config)?.entity_id}render(){if(this.load.state==="loading")return g`<div class="notice">Loading cameras…</div>`;if(this.load.state==="error")return g`<div class="notice">Camera Hub is not available: ${this.load.message}</div>`;let{cameras:e}=this.load.config,t=e.find((s)=>s.entity_id===this.selected);return g`
      <div class="layout">
        <camera-hub-main-view .hass=${this.hass} .camera=${t}></camera-hub-main-view>
        <camera-hub-tile-rail
          .hass=${this.hass}
          .cameras=${e}
          .selected=${this.selected}
        ></camera-hub-tile-rail>
      </div>
    `}static styles=[H,A`
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
        --ch-rail-columns: 3;
      }
      /* Tablet and desktop: the tiles sit in a column next to the main view. */
      @container (min-width: 900px) {
        .layout {
          grid-template-columns: minmax(0, 1fr) clamp(280px, 30%, 420px);
          align-items: start;
          --ch-rail-columns: 2;
        }
      }
      .notice {
        padding: 24px;
        color: var(--ch-text-secondary);
      }
    `]}customElements.define("camera-hub-card",Ze);var et=window;et.customCards??=[];et.customCards.push({type:"camera-hub-card",name:"Camera Hub",description:"Live cameras, clips and alerts from Frigate."});console.info("Camera Hub card 0.0.2");export{Ze as CameraHubCard};
