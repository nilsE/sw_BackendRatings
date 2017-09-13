Ext.define('Shopware.apps.Index.netzpBackendRatingsWidget.store.Ratings', {

    extend: 'Ext.data.Store',
 
    model: 'Shopware.apps.Index.netzpBackendRatingsWidget.model.Ratings', 
    remoteFilter: true,
    autoLoad: true,
    clearOnLoad: false,

    proxy: {
        type: 'ajax',
 
        url: '{url controller="NetzpBackendWidgets" action="getRatings"}',
 
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});