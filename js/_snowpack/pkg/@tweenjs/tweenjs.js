var v=Object.freeze({Linear:Object.freeze({None:function(t){return t},In:function(t){return t},Out:function(t){return t},InOut:function(t){return t}}),Quadratic:Object.freeze({In:function(t){return t*t},Out:function(t){return t*(2-t)},InOut:function(t){return(t*=2)<1?.5*t*t:-.5*(--t*(t-2)-1)}}),Cubic:Object.freeze({In:function(t){return t*t*t},Out:function(t){return--t*t*t+1},InOut:function(t){return(t*=2)<1?.5*t*t*t:.5*((t-=2)*t*t+2)}}),Quartic:Object.freeze({In:function(t){return t*t*t*t},Out:function(t){return 1- --t*t*t*t},InOut:function(t){return(t*=2)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2)}}),Quintic:Object.freeze({In:function(t){return t*t*t*t*t},Out:function(t){return--t*t*t*t*t+1},InOut:function(t){return(t*=2)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)}}),Sinusoidal:Object.freeze({In:function(t){return 1-Math.sin((1-t)*Math.PI/2)},Out:function(t){return Math.sin(t*Math.PI/2)},InOut:function(t){return .5*(1-Math.sin(Math.PI*(.5-t)))}}),Exponential:Object.freeze({In:function(t){return t===0?0:Math.pow(1024,t-1)},Out:function(t){return t===1?1:1-Math.pow(2,-10*t)},InOut:function(t){return t===0?0:t===1?1:(t*=2)<1?.5*Math.pow(1024,t-1):.5*(-Math.pow(2,-10*(t-1))+2)}}),Circular:Object.freeze({In:function(t){return 1-Math.sqrt(1-t*t)},Out:function(t){return Math.sqrt(1- --t*t)},InOut:function(t){return(t*=2)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)}}),Elastic:Object.freeze({In:function(t){return t===0?0:t===1?1:-Math.pow(2,10*(t-1))*Math.sin((t-1.1)*5*Math.PI)},Out:function(t){return t===0?0:t===1?1:Math.pow(2,-10*t)*Math.sin((t-.1)*5*Math.PI)+1},InOut:function(t){return t===0?0:t===1?1:(t*=2,t<1?-.5*Math.pow(2,10*(t-1))*Math.sin((t-1.1)*5*Math.PI):.5*Math.pow(2,-10*(t-1))*Math.sin((t-1.1)*5*Math.PI)+1)}}),Back:Object.freeze({In:function(t){var e=1.70158;return t===1?1:t*t*((e+1)*t-e)},Out:function(t){var e=1.70158;return t===0?0:--t*t*((e+1)*t+e)+1},InOut:function(t){var e=1.70158*1.525;return(t*=2)<1?.5*(t*t*((e+1)*t-e)):.5*((t-=2)*t*((e+1)*t+e)+2)}}),Bounce:Object.freeze({In:function(t){return 1-v.Bounce.Out(1-t)},Out:function(t){return t<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375},InOut:function(t){return t<.5?v.Bounce.In(t*2)*.5:v.Bounce.Out(t*2-1)*.5+.5}}),generatePow:function(t){return t===void 0&&(t=4),t=t<Number.EPSILON?Number.EPSILON:t,t=t>1e4?1e4:t,{In:function(e){return Math.pow(e,t)},Out:function(e){return 1-Math.pow(1-e,t)},InOut:function(e){return e<.5?Math.pow(e*2,t)/2:(1-Math.pow(2-e*2,t))/2+.5}}}}),y=function(){return performance.now()},w=function(){function t(){for(var e=[],i=0;i<arguments.length;i++)e[i]=arguments[i];this._tweens={},this._tweensAddedDuringUpdate={},this.add.apply(this,e)}return t.prototype.getAll=function(){var e=this;return Object.keys(this._tweens).map(function(i){return e._tweens[i]})},t.prototype.removeAll=function(){this._tweens={}},t.prototype.add=function(){for(var e,i=[],r=0;r<arguments.length;r++)i[r]=arguments[r];for(var n=0,a=i;n<a.length;n++){var s=a[n];(e=s._group)===null||e===void 0||e.remove(s),s._group=this,this._tweens[s.getId()]=s,this._tweensAddedDuringUpdate[s.getId()]=s}},t.prototype.remove=function(){for(var e=[],i=0;i<arguments.length;i++)e[i]=arguments[i];for(var r=0,n=e;r<n.length;r++){var a=n[r];a._group=void 0,delete this._tweens[a.getId()],delete this._tweensAddedDuringUpdate[a.getId()]}},t.prototype.allStopped=function(){return this.getAll().every(function(e){return!e.isPlaying()})},t.prototype.update=function(e,i){e===void 0&&(e=y()),i===void 0&&(i=!0);var r=Object.keys(this._tweens);if(r.length!==0)for(;r.length>0;){this._tweensAddedDuringUpdate={};for(var n=0;n<r.length;n++){var a=this._tweens[r[n]],s=!i;a&&a.update(e,s)===!1&&!i&&this.remove(a)}r=Object.keys(this._tweensAddedDuringUpdate)}},t}(),p={Linear:function(t,e){var i=t.length-1,r=i*e,n=Math.floor(r),a=p.Utils.Linear;return e<0?a(t[0],t[1],r):e>1?a(t[i],t[i-1],i-r):a(t[n],t[n+1>i?i:n+1],r-n)},Bezier:function(t,e){for(var i=0,r=t.length-1,n=Math.pow,a=p.Utils.Bernstein,s=0;s<=r;s++)i+=n(1-e,r-s)*n(e,s)*t[s]*a(r,s);return i},CatmullRom:function(t,e){var i=t.length-1,r=i*e,n=Math.floor(r),a=p.Utils.CatmullRom;return t[0]===t[i]?(e<0&&(n=Math.floor(r=i*(1+e))),a(t[(n-1+i)%i],t[n],t[(n+1)%i],t[(n+2)%i],r-n)):e<0?t[0]-(a(t[0],t[0],t[1],t[1],-r)-t[0]):e>1?t[i]-(a(t[i],t[i],t[i-1],t[i-1],r-i)-t[i]):a(t[n?n-1:0],t[n],t[i<n+1?i:n+1],t[i<n+2?i:n+2],r-n)},Utils:{Linear:function(t,e,i){return(e-t)*i+t},Bernstein:function(t,e){var i=p.Utils.Factorial;return i(t)/i(e)/i(t-e)},Factorial:function(){var t=[1];return function(e){var i=1;if(t[e])return t[e];for(var r=e;r>1;r--)i*=r;return t[e]=i,i}}(),CatmullRom:function(t,e,i,r,n){var a=(i-t)*.5,s=(r-e)*.5,h=n*n,f=n*h;return(2*e-2*i+a+s)*f+(-3*e+3*i-2*a-s)*h+a*n+e}}},O=function(){function t(){}return t.nextId=function(){return t._nextId++},t._nextId=0,t}(),I=new w,M=function(){function t(e,i){this._isPaused=!1,this._pauseStart=0,this._valuesStart={},this._valuesEnd={},this._valuesStartRepeat={},this._duration=1e3,this._isDynamic=!1,this._initialRepeat=0,this._repeat=0,this._yoyo=!1,this._isPlaying=!1,this._reversed=!1,this._delayTime=0,this._startTime=0,this._easingFunction=v.Linear.None,this._interpolationFunction=p.Linear,this._chainedTweens=[],this._onStartCallbackFired=!1,this._onEveryStartCallbackFired=!1,this._id=O.nextId(),this._isChainStopped=!1,this._propertiesAreSetUp=!1,this._goToEnd=!1,this._object=e,typeof i=="object"?(this._group=i,i.add(this)):i===!0&&(this._group=I,I.add(this))}return t.prototype.getId=function(){return this._id},t.prototype.isPlaying=function(){return this._isPlaying},t.prototype.isPaused=function(){return this._isPaused},t.prototype.getDuration=function(){return this._duration},t.prototype.to=function(e,i){if(i===void 0&&(i=1e3),this._isPlaying)throw new Error("Can not call Tween.to() while Tween is already started or paused. Stop the Tween first.");return this._valuesEnd=e,this._propertiesAreSetUp=!1,this._duration=i<0?0:i,this},t.prototype.duration=function(e){return e===void 0&&(e=1e3),this._duration=e<0?0:e,this},t.prototype.dynamic=function(e){return e===void 0&&(e=!1),this._isDynamic=e,this},t.prototype.start=function(e,i){if(e===void 0&&(e=y()),i===void 0&&(i=!1),this._isPlaying)return this;if(this._repeat=this._initialRepeat,this._reversed){this._reversed=!1;for(var r in this._valuesStartRepeat)this._swapEndStartRepeatValues(r),this._valuesStart[r]=this._valuesStartRepeat[r]}if(this._isPlaying=!0,this._isPaused=!1,this._onStartCallbackFired=!1,this._onEveryStartCallbackFired=!1,this._isChainStopped=!1,this._startTime=e,this._startTime+=this._delayTime,!this._propertiesAreSetUp||i){if(this._propertiesAreSetUp=!0,!this._isDynamic){var n={};for(var a in this._valuesEnd)n[a]=this._valuesEnd[a];this._valuesEnd=n}this._setupProperties(this._object,this._valuesStart,this._valuesEnd,this._valuesStartRepeat,i)}return this},t.prototype.startFromCurrentValues=function(e){return this.start(e,!0)},t.prototype._setupProperties=function(e,i,r,n,a){for(var s in r){var h=e[s],f=Array.isArray(h),_=f?"array":typeof h,u=!f&&Array.isArray(r[s]);if(!(_==="undefined"||_==="function")){if(u){var o=r[s];if(o.length===0)continue;for(var g=[h],d=0,C=o.length;d<C;d+=1){var S=this._handleRelativeValue(h,o[d]);if(isNaN(S)){u=!1,console.warn("Found invalid interpolation list. Skipping.");break}g.push(S)}u&&(r[s]=g)}if((_==="object"||f)&&h&&!u){i[s]=f?[]:{};var b=h;for(var c in b)i[s][c]=b[c];n[s]=f?[]:{};var o=r[s];if(!this._isDynamic){var P={};for(var c in o)P[c]=o[c];r[s]=o=P}this._setupProperties(b,i[s],o,n[s],a)}else(typeof i[s]=="undefined"||a)&&(i[s]=h),f||(i[s]*=1),u?n[s]=r[s].slice().reverse():n[s]=i[s]||0}}},t.prototype.stop=function(){return this._isChainStopped||(this._isChainStopped=!0,this.stopChainedTweens()),this._isPlaying?(this._isPlaying=!1,this._isPaused=!1,this._onStopCallback&&this._onStopCallback(this._object),this):this},t.prototype.end=function(){return this._goToEnd=!0,this.update(this._startTime+this._duration),this},t.prototype.pause=function(e){return e===void 0&&(e=y()),this._isPaused||!this._isPlaying?this:(this._isPaused=!0,this._pauseStart=e,this)},t.prototype.resume=function(e){return e===void 0&&(e=y()),!this._isPaused||!this._isPlaying?this:(this._isPaused=!1,this._startTime+=e-this._pauseStart,this._pauseStart=0,this)},t.prototype.stopChainedTweens=function(){for(var e=0,i=this._chainedTweens.length;e<i;e++)this._chainedTweens[e].stop();return this},t.prototype.group=function(e){return e?(e.add(this),this):(console.warn("tween.group() without args has been removed, use group.add(tween) instead."),this)},t.prototype.remove=function(){var e;return(e=this._group)===null||e===void 0||e.remove(this),this},t.prototype.delay=function(e){return e===void 0&&(e=0),this._delayTime=e,this},t.prototype.repeat=function(e){return e===void 0&&(e=0),this._initialRepeat=e,this._repeat=e,this},t.prototype.repeatDelay=function(e){return this._repeatDelayTime=e,this},t.prototype.yoyo=function(e){return e===void 0&&(e=!1),this._yoyo=e,this},t.prototype.easing=function(e){return e===void 0&&(e=v.Linear.None),this._easingFunction=e,this},t.prototype.interpolation=function(e){return e===void 0&&(e=p.Linear),this._interpolationFunction=e,this},t.prototype.chain=function(){for(var e=[],i=0;i<arguments.length;i++)e[i]=arguments[i];return this._chainedTweens=e,this},t.prototype.onStart=function(e){return this._onStartCallback=e,this},t.prototype.onEveryStart=function(e){return this._onEveryStartCallback=e,this},t.prototype.onUpdate=function(e){return this._onUpdateCallback=e,this},t.prototype.onRepeat=function(e){return this._onRepeatCallback=e,this},t.prototype.onComplete=function(e){return this._onCompleteCallback=e,this},t.prototype.onStop=function(e){return this._onStopCallback=e,this},t.prototype.update=function(e,i){var r=this,n;if(e===void 0&&(e=y()),i===void 0&&(i=t.autoStartOnUpdate),this._isPaused)return!0;var a;if(!this._goToEnd&&!this._isPlaying)if(i)this.start(e,!0);else return!1;if(this._goToEnd=!1,e<this._startTime)return!0;this._onStartCallbackFired===!1&&(this._onStartCallback&&this._onStartCallback(this._object),this._onStartCallbackFired=!0),this._onEveryStartCallbackFired===!1&&(this._onEveryStartCallback&&this._onEveryStartCallback(this._object),this._onEveryStartCallbackFired=!0);var s=e-this._startTime,h=this._duration+((n=this._repeatDelayTime)!==null&&n!==void 0?n:this._delayTime),f=this._duration+this._repeat*h,_=function(){if(r._duration===0||s>f)return 1;var S=Math.trunc(s/h),b=s-S*h,c=Math.min(b/r._duration,1);return c===0&&s===r._duration?1:c},u=_(),o=this._easingFunction(u);if(this._updateProperties(this._object,this._valuesStart,this._valuesEnd,o),this._onUpdateCallback&&this._onUpdateCallback(this._object,u),this._duration===0||s>=this._duration)if(this._repeat>0){var g=Math.min(Math.trunc((s-this._duration)/h)+1,this._repeat);isFinite(this._repeat)&&(this._repeat-=g);for(a in this._valuesStartRepeat)!this._yoyo&&typeof this._valuesEnd[a]=="string"&&(this._valuesStartRepeat[a]=this._valuesStartRepeat[a]+parseFloat(this._valuesEnd[a])),this._yoyo&&this._swapEndStartRepeatValues(a),this._valuesStart[a]=this._valuesStartRepeat[a];return this._yoyo&&(this._reversed=!this._reversed),this._startTime+=h*g,this._onRepeatCallback&&this._onRepeatCallback(this._object),this._onEveryStartCallbackFired=!1,!0}else{this._onCompleteCallback&&this._onCompleteCallback(this._object);for(var d=0,C=this._chainedTweens.length;d<C;d++)this._chainedTweens[d].start(this._startTime+this._duration,!1);return this._isPlaying=!1,!1}return!0},t.prototype._updateProperties=function(e,i,r,n){for(var a in r)if(i[a]!==void 0){var s=i[a]||0,h=r[a],f=Array.isArray(e[a]),_=Array.isArray(h),u=!f&&_;u?e[a]=this._interpolationFunction(h,n):typeof h=="object"&&h?this._updateProperties(e[a],s,h,n):(h=this._handleRelativeValue(s,h),typeof h=="number"&&(e[a]=s+(h-s)*n))}},t.prototype._handleRelativeValue=function(e,i){return typeof i!="string"?i:i.charAt(0)==="+"||i.charAt(0)==="-"?e+parseFloat(i):parseFloat(i)},t.prototype._swapEndStartRepeatValues=function(e){var i=this._valuesStartRepeat[e],r=this._valuesEnd[e];typeof r=="string"?this._valuesStartRepeat[e]=this._valuesStartRepeat[e]+parseFloat(r):this._valuesStartRepeat[e]=this._valuesEnd[e],this._valuesEnd[e]=i},t.autoStartOnUpdate=!1,t}(),T="25.0.0",E=O.nextId,l=I,R=l.getAll.bind(l),k=l.removeAll.bind(l),j=l.add.bind(l),A=l.remove.bind(l),F=l.update.bind(l);export{v as Easing,w as Group,p as Interpolation,O as Sequence,M as Tween,T as VERSION,j as add,R as getAll,E as nextId,y as now,A as remove,k as removeAll,F as update};
