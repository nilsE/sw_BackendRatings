Ext.define('Shopware.apps.Index.netzpBackendRatingsWidget.model.Ratings', {
 
    extend: 'Ext.data.Model',
 
    fields: [
        { name: 'open', type: 'integer' },
    ],

    hasMany: {
        name: 'ratings',
        model: 'Shopware.apps.Index.netzpBackendRatingsWidget.model.Rating',
    }
});
