define(["layoutManager","loading","registrationServices","globalize","libraryBrowser","mainTabsManager","cardBuilder","apphost","imageLoader","scrollStyles","emby-itemscontainer","emby-tabs","emby-button"],function(layoutManager,loading,registrationServices,globalize,libraryBrowser,mainTabsManager,cardBuilder,appHost,imageLoader){"use strict";function enableScrollX(){return!layoutManager.desktop}function getBackdropShape(){return enableScrollX()?"overflowBackdrop":"backdrop"}function getPortraitShape(){return enableScrollX()?"overflowPortrait":"portrait"}function getLimit(){return enableScrollX()?12:8}function loadRecommendedPrograms(page){loading.show();var limit=getLimit();enableScrollX()&&(limit*=2),ApiClient.getLiveTvRecommendedPrograms({userId:Dashboard.getCurrentUserId(),IsAiring:!0,limit:limit,ImageTypeLimit:1,EnableImageTypes:"Primary,Thumb,Backdrop",EnableTotalRecordCount:!1,Fields:"ChannelInfo,PrimaryImageAspectRatio"}).then(function(result){renderItems(page,result.Items,"activeProgramItems","play",{showAirDateTime:!1,showAirEndTime:!0}),loading.hide()})}function reload(page,enableFullRender){enableFullRender&&(loadRecommendedPrograms(page),ApiClient.getLiveTvRecommendedPrograms({userId:Dashboard.getCurrentUserId(),HasAired:!1,limit:getLimit(),IsMovie:!1,IsSports:!1,IsKids:!1,IsNews:!1,IsSeries:!0,EnableTotalRecordCount:!1,Fields:"ChannelInfo,PrimaryImageAspectRatio",EnableImageTypes:"Primary,Thumb"}).then(function(result){renderItems(page,result.Items,"upcomingEpisodeItems")}),ApiClient.getLiveTvRecommendedPrograms({userId:Dashboard.getCurrentUserId(),HasAired:!1,limit:getLimit(),IsMovie:!0,EnableTotalRecordCount:!1,Fields:"ChannelInfo",EnableImageTypes:"Primary,Thumb"}).then(function(result){renderItems(page,result.Items,"upcomingTvMovieItems",null,{shape:getPortraitShape(),preferThumb:null,showParentTitle:!1})}),ApiClient.getLiveTvRecommendedPrograms({userId:Dashboard.getCurrentUserId(),HasAired:!1,limit:getLimit(),IsSports:!0,EnableTotalRecordCount:!1,Fields:"ChannelInfo,PrimaryImageAspectRatio",EnableImageTypes:"Primary,Thumb"}).then(function(result){renderItems(page,result.Items,"upcomingSportsItems")}),ApiClient.getLiveTvRecommendedPrograms({userId:Dashboard.getCurrentUserId(),HasAired:!1,limit:getLimit(),IsKids:!0,EnableTotalRecordCount:!1,Fields:"ChannelInfo,PrimaryImageAspectRatio",EnableImageTypes:"Primary,Thumb"}).then(function(result){renderItems(page,result.Items,"upcomingKidsItems")}),ApiClient.getLiveTvRecommendedPrograms({userId:Dashboard.getCurrentUserId(),HasAired:!1,limit:getLimit(),IsNews:!0,EnableTotalRecordCount:!1,Fields:"ChannelInfo,PrimaryImageAspectRatio",EnableImageTypes:"Primary,Thumb"}).then(function(result){renderItems(page,result.Items,"upcomingNewsItems",null,{showParentTitleOrTitle:!0,showTitle:!1,showParentTitle:!1})}))}function renderItems(page,items,sectionClass,overlayButton,cardOptions){var html=cardBuilder.getCardsHtml(Object.assign({items:items,preferThumb:"auto",inheritThumb:!1,shape:enableScrollX()?"autooverflow":"auto",defaultShape:getBackdropShape(),showParentTitle:!0,showTitle:!0,centerText:!0,coverImage:!0,overlayText:!1,lazy:!0,overlayPlayButton:"play"===overlayButton,overlayMoreButton:"more"===overlayButton,overlayInfoButton:"info"===overlayButton,allowBottomPadding:!enableScrollX(),showAirTime:!0,showAirDateTime:!0},cardOptions||{})),elem=page.querySelector("."+sectionClass);elem.innerHTML=html,imageLoader.lazyChildren(elem)}function getTabs(){return[{name:globalize.translate("Programs")},{name:globalize.translate("TabGuide")},{name:globalize.translate("TabChannels")},{name:globalize.translate("TabRecordings")},{name:globalize.translate("HeaderSchedule")},{name:globalize.translate("TabSeries")},{name:globalize.translate("ButtonSearch")}]}function validateUnlock(view,showDialog){registrationServices.validateFeature("livetv",{showDialog:showDialog,viewOnly:!0}).then(function(){view.querySelector(".liveTvContainer").classList.remove("hide"),view.querySelector(".unlockContainer").classList.add("hide")},function(){view.querySelector(".liveTvContainer").classList.add("hide"),view.querySelector(".unlockContainer").classList.remove("hide")})}return function(view,params){function enableFullRender(){return(new Date).getTime()-lastFullRender>3e5}function onBeforeTabChange(e){preLoadTab(view,parseInt(e.detail.selectedTabIndex))}function onTabChange(e){var previousTabController=tabControllers[parseInt(e.detail.previousIndex)];previousTabController&&previousTabController.onHide&&previousTabController.onHide(),loadTab(view,parseInt(e.detail.selectedTabIndex))}function initTabs(){var tabsReplaced=mainTabsManager.setTabs(view,currentTabIndex,getTabs);if(tabsReplaced){var viewTabs=document.querySelector(".tabs-viewmenubar");viewTabs.addEventListener("beforetabchange",onBeforeTabChange),viewTabs.addEventListener("tabchange",onTabChange),libraryBrowser.configurePaperLibraryTabs(view,viewTabs,view.querySelectorAll(".pageTabContent"),[0,2,3,4,5]),viewTabs.triggerBeforeTabChange||viewTabs.addEventListener("ready",function(){viewTabs.triggerBeforeTabChange()})}}function getTabController(page,index,callback){var depends=[];switch(index){case 0:break;case 1:depends.push("scripts/livetvguide");break;case 2:depends.push("scripts/livetvchannels");break;case 3:depends.push("scripts/livetvrecordings");break;case 4:depends.push("scripts/livetvschedule");break;case 5:depends.push("scripts/livetvseriestimers");break;case 6:depends.push("scripts/searchtab")}require(depends,function(controllerFactory){var tabContent;0==index&&(tabContent=view.querySelector(".pageTabContent[data-index='"+index+"']"),self.tabContent=tabContent);var controller=tabControllers[index];controller||(tabContent=view.querySelector(".pageTabContent[data-index='"+index+"']"),controller=0===index?self:6===index?new controllerFactory(view,tabContent,{collectionType:"livetv"}):new controllerFactory(view,params,tabContent),tabControllers[index]=controller,controller.initTab&&controller.initTab()),callback(controller)})}function preLoadTab(page,index){getTabController(page,index,function(controller){renderedTabs.indexOf(index)==-1&&controller.preRender&&controller.preRender()})}function loadTab(page,index){currentTabIndex=index,getTabController(page,index,function(controller){1===index?document.body.classList.add("autoScrollY"):document.body.classList.remove("autoScrollY"),renderedTabs.indexOf(index)==-1?(1===index&&renderedTabs.push(index),controller.renderTab()):controller.onShow&&controller.onShow(),currentTabController=controller})}var self=this,currentTabIndex=parseInt(params.tab||"0"),lastFullRender=0;view.querySelector(".unlockText").innerHTML=globalize.translate("sharedcomponents#LiveTvRequiresUnlock"),validateUnlock(view,!1),self.initTab=function(){for(var tabContent=view.querySelector(".pageTabContent[data-index='0']"),containers=tabContent.querySelectorAll(".itemsContainer"),i=0,length=containers.length;i<length;i++)enableScrollX()?(containers[i].classList.add("hiddenScrollX"),containers[i].classList.remove("vertical-wrap")):(containers[i].classList.remove("hiddenScrollX"),containers[i].classList.add("vertical-wrap"))},self.renderTab=function(){var tabContent=view.querySelector(".pageTabContent[data-index='0']");enableFullRender()?(reload(tabContent,!0),lastFullRender=(new Date).getTime()):reload(tabContent)};var currentTabController,tabControllers=[],renderedTabs=[];view.querySelector(".btnUnlock").addEventListener("click",function(){validateUnlock(view,!0)}),view.addEventListener("viewbeforeshow",function(e){initTabs();var tabs=mainTabsManager.getTabsElement();tabs.triggerBeforeTabChange&&tabs.triggerBeforeTabChange()}),view.addEventListener("viewshow",function(e){mainTabsManager.getTabsElement().triggerTabChange()}),view.addEventListener("viewbeforehide",function(e){currentTabController&&currentTabController.onHide&&currentTabController.onHide(),document.body.classList.remove("autoScrollY")}),view.addEventListener("viewdestroy",function(e){tabControllers.forEach(function(t){t.destroy&&t.destroy()})})}});