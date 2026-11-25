'use strict';
(function(root){
 const paths={"search": "<circle cx=\"10.5\" cy=\"10.5\" r=\"6.5\"/><path d=\"m15.5 15.5 4.5 4.5\"/>", "bag": "<path d=\"M5 8h14l1 13H4L5 8Z\"/><path d=\"M9 9V6a3 3 0 0 1 6 0v3\"/>", "user": "<circle cx=\"12\" cy=\"7\" r=\"3.5\"/><path d=\"M5 21v-2a7 7 0 0 1 14 0v2\"/>", "heart": "<path d=\"m12 20-7.5-7.2a4.8 4.8 0 0 1 6.8-6.8l.7.7.7-.7a4.8 4.8 0 0 1 6.8 6.8L12 20Z\"/>", "arrowRight": "<path d=\"M4 12h16m-6-6 6 6-6 6\"/>", "arrowLeft": "<path d=\"M20 12H4m6-6-6 6 6 6\"/>", "arrowUpRight": "<path d=\"M6 18 18 6M6 6h12v12\"/>", "plus": "<path d=\"M5 12h14M12 5v14\"/>", "minus": "<path d=\"M5 12h14\"/>", "close": "<path d=\"m6 6 12 12M6 18 18 6\"/>", "check": "<path d=\"m5 12 4 4L19 6\"/>", "menu": "<path d=\"M4 6h16M4 12h16M4 18h16\"/>", "pin": "<path d=\"M19 9c0 5-7 12-7 12S5 14 5 9a7 7 0 0 1 14 0Z\"/><circle cx=\"12\" cy=\"9\" r=\"2\"/>", "trash": "<path d=\"M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7\"/>", "restart": "<path d=\"M4 10a8 8 0 1 1 1 8M4 4v6h6\"/>"};

 Object.assign(paths, {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.7"/>',
  eyeOff: '<path d="m3 3 18 18M6 6.6A13 13 0 0 1 12 5.5c6.5 0 10 6.5 10 6.5a15 15 0 0 1-3.2 3.7M16.8 17.5a10.8 10.8 0 0 1-4.8 1C5.5 18.5 2 12 2 12a13 13 0 0 1 2.5-3.1"/>',
  phone: '<path d="M21 16.5v3a1.5 1.5 0 0 1-1.7 1.5A18 18 0 0 1 3 4.7 1.5 1.5 0 0 1 4.5 3h3l1.2 4.5-2 1.6a13 13 0 0 0 8.2 8.2l1.6-2Z"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  store: '<path d="m4 4-2 5v3a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0V9l-2-5H4ZM4 15v6h16v-6M8 21v-5h4v5M2 9h20"/>',
  truck: '<path d="M3 5h12v13H3Z M15 10h4l3 4v4h-7"/><circle cx="7" cy="18" r="2" fill="white"/><circle cx="18" cy="18" r="2" fill="white"/>',
  logout: '<path d="M13 4h6v16h-6M5 12h10m-6-4-4 4 4 4"/>'
 });
 function svg(name,extraClass=''){if(!paths[name])throw Error('Unknown UI icon: '+name);return '<svg class="ui-icon '+extraClass+'" data-ui-icon="'+name+'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+paths[name]+'</svg>';}
 root.HlebnoIcons=Object.freeze({svg});
})(globalThis);
