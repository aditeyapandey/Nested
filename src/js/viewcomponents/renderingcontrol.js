(function(){

    renderingControl = {};

    renderingControl.onInitialLoad = function ()
    {
        dataPanelUI.header();
        dataPanelUI.selectDropDown();  
        dataPanelUI.uploadFile();
        taskPanelUI.header();
        taskPanelUI.createTaskIcons();
        taskPanelUI.createQueryIcons();
        recPanelUI.header();  
    }

    renderingControl.visUpdate = function (recommendation)
    {
        recPanelUI.recommendationInformation(recommendation);
        recPanelUI.visualizationNavBar(recommendation);
        recPanelUI.renderWidgets(recommendation);
        recPanelUI.renderRecommendation(recommendation);
        dataPanelUI.attrSelectionBtn();
        dataPanelUI.treeSummaryPanel();
    }


}());