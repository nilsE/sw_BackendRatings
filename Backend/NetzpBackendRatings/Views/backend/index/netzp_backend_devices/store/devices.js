Ext.define('Shopware.apps.Index.netzpBackendDevicesWidget.store.Devices', {

    extend: 'Ext.data.Store',
 
    model: 'Shopware.apps.Index.netzpBackendDevicesWidget.model.Devices', 
    remoteFilter: true,
    autoLoad: true,
    clearOnLoad: false,

    proxy: {
        type: 'ajax',
 
        url: '{url controller="NetzpBackendWidgets" action="getDevices"}',
 
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});