"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[757],{8757:(x,c,s)=>{s.r(c),s.d(c,{PlaylistDetailsComponent:()=>P});var _=s(3189),r=s(177),p=s(206),t=s(3953),m=s(5274),y=s(4005),g=s(5559);function d(n,o){if(1&n&&t.nrm(0,"img",13),2&n){const e=t.XpG(2);t.Y8G("src",e.playlist.imageUrls[0],t.B4B)}}function u(n,o){1&n&&t.nrm(0,"div",14)}function f(n,o){1&n&&(t.j41(0,"div",15),t.EFF(1," No songs found! "),t.k0s())}function h(n,o){if(1&n){const e=t.RV6();t.j41(0,"app-song",16),t.bIt("playRequest",function(i){t.eBV(e);const a=t.XpG(2);return t.Njj(a.onPlay(i))})("deleteRequest",function(i){t.eBV(e);const a=t.XpG(2);return t.Njj(a.onDelete(i))}),t.k0s()}2&n&&t.Y8G("song",o.$implicit)}function v(n,o){if(1&n){const e=t.RV6();t.j41(0,"div",2)(1,"div",3)(2,"div",4),t.DNE(3,d,1,1,"img",5)(4,u,1,0,"ng-template",null,0,t.C5r),t.k0s(),t.j41(6,"div",6)(7,"h2",7),t.EFF(8),t.k0s(),t.j41(9,"p",8),t.EFF(10),t.k0s(),t.j41(11,"button",9),t.bIt("click",function(){t.eBV(e);const i=t.XpG();return t.Njj(i.onDeletePlaylist(i.playlistId))}),t.j41(12,"mat-icon"),t.EFF(13,"delete"),t.k0s()()()(),t.DNE(14,f,2,0,"div",10),t.j41(15,"div",11),t.DNE(16,h,1,1,"app-song",12),t.k0s()()}if(2&n){const e=t.sdS(5),l=t.XpG();t.R7$(3),t.Y8G("ngIf",null==l.playlist.imageUrls?null:l.playlist.imageUrls.length)("ngIfElse",e),t.R7$(5),t.JRh(l.playlist.name||"Unnamed Playlist"),t.R7$(2),t.JRh(l.playlist.ownerDisplayName||"Unknown"),t.R7$(4),t.Y8G("ngIf",0===l.songs.length),t.R7$(2),t.Y8G("ngForOf",l.songs)}}let P=(()=>{class n{playlistService;snackBarService;router;route;playlistId;songs=[];playlist;constructor(e,l,i,a){this.playlistService=e,this.snackBarService=l,this.router=i,this.route=a}ngOnInit(){this.playlistId=this.route.snapshot.paramMap.get("id"),this.playlistId&&(this.getPlaylistDetails(),this.getSongsForPlaylist())}getPlaylistDetails(){this.playlistService.getOnePlaylist(this.playlistId).subscribe({next:e=>{this.playlist=e},error:e=>{console.error("Error fetching the playlist with the id: "+this.playlistId,e)}})}getSongsForPlaylist(){this.playlistService.getSongsFormPlaylist(this.playlistId).subscribe({next:e=>{this.songs=e},error:e=>{console.error("Error fetching Songs for the playlist with the id: "+this.playlistId,e)}})}onPlay(e){}onDelete(e){this.playlistService.removeSongFromPlaylist({playlistId:this.playlistId,songId:e}).subscribe({next:i=>{this.snackBarService.success(i),this.songs=this.songs.filter(a=>a.id!==e)},error:i=>{console.error("Error removing song from playlist:",i)}})}onDeletePlaylist(e){this.playlistService.deletePlaylist(e).subscribe({next:()=>{this.router.navigate(["/home"]),this.snackBarService.success("Playlist deleted successfully")},error:l=>{console.error("Error deleting playlist:",l),this.snackBarService.error("Error deleting playlist: "+l)}})}static \u0275fac=function(l){return new(l||n)(t.rXU(m.q),t.rXU(y.v),t.rXU(g.Ix),t.rXU(g.nX))};static \u0275cmp=t.VBU({type:n,selectors:[["app-playlist-details"]],decls:1,vars:1,consts:[["noImage",""],["class","playlist-container",4,"ngIf"],[1,"playlist-container"],[1,"playlist-header"],[1,"album-image-container"],["alt","Album cover","class","album-image",3,"src",4,"ngIf","ngIfElse"],[1,"album-info"],[1,"album-title"],[1,"album-owner"],["mat-icon-button","","color","warn",1,"delete-button",3,"click"],["class","text-gray-400 text-center mt-6",4,"ngIf"],[1,"song-list"],[3,"song","playRequest","deleteRequest",4,"ngFor","ngForOf"],["alt","Album cover",1,"album-image",3,"src"],[1,"album-image","no-image"],[1,"text-gray-400","text-center","mt-6"],[3,"playRequest","deleteRequest","song"]],template:function(l,i){1&l&&t.DNE(0,v,17,6,"div",1),2&l&&t.Y8G("ngIf",i.playlistId&&i.playlist)},dependencies:[_.R,r.MD,r.Sq,r.bT,p.m_,p.An],styles:[".playlist-container[_ngcontent-%COMP%]{background-color:#121212;color:#fff;font-family:Arial,sans-serif;padding:20px;min-height:100vh;display:flex;flex-direction:column}.playlist-header[_ngcontent-%COMP%]{display:flex;align-items:center;width:100%;margin-bottom:20px;position:relative}.album-image-container[_ngcontent-%COMP%]{margin-right:20px}.album-image[_ngcontent-%COMP%]{width:300px;height:300px;object-fit:cover;border-radius:50%;margin-left:20px}.album-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;margin-left:10px;position:relative;flex-grow:1;justify-content:center}.album-title[_ngcontent-%COMP%]{font-size:64px;font-weight:700;margin:0}.album-owner[_ngcontent-%COMP%]{font-size:20px;color:#aaa;margin:5px 10px}.delete-button[_ngcontent-%COMP%]{position:absolute;right:30px;top:200px;color:#fff}.song-list[_ngcontent-%COMP%]{flex-grow:1;margin-top:20px;padding:20px}.no-image[_ngcontent-%COMP%]{background-color:#444;width:300px;height:300px;object-fit:cover;border-radius:50%;margin-left:20px}"]})}return n})()}}]);