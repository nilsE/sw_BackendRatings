Ext.define('Shopware.apps.Index.netzpBackendRatingsWidget.model.Rating', {
 
    extend: 'Ext.data.Model',
    fields: [
        { name: 'points', type: 'integer' },
        { name: 'count',  type: 'integer' }
    ]
});
