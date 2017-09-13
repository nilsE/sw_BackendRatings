Ext.define('Shopware.apps.Index.netzpBackendDevicesWidget.model.Device', {
 
    extend: 'Ext.data.Model',
 
    fields: [
        { name: 'orderCount', type: 'number' },
        { name: 'turnover',  type: 'number' },
        { name: 'deviceType', type: 'string' }
    ]
});
