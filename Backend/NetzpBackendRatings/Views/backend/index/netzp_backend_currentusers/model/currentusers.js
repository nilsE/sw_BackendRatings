Ext.define('Shopware.apps.Index.netzpBackendCurrentUsersWidget.model.Currentusers', {
 
    extend: 'Ext.data.Model',
 
    fields: [
        { name: 'deviceType', type: 'string' },
        { name: 'count', type: 'number' }
    ]
});
