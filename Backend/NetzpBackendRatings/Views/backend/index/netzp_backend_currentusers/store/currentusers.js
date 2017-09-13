Ext.define('Shopware.apps.Index.netzpBackendCurrentUsersWidget.store.Currentusers', {

    extend: 'Ext.data.Store',
 
    model: 'Shopware.apps.Index.netzpBackendCurrentUsersWidget.model.Currentusers', 
    remoteFilter: true,
    autoLoad: true,
    clearOnLoad: false,

    proxy: {
        type: 'ajax',
 
        url: '{url controller="NetzpBackendWidgets" action="getCurrentUsers"}',
 
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});