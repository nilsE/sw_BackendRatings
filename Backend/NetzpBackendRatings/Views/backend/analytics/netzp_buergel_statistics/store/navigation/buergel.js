

//{block name="backend/analytics/netzp_buergel_statistics/store/navigation/buergel"}
Ext.define('Shopware.apps.Analytics.netzpBuergelStatistics.store.navigation.Buergel', {
    extend: 'Ext.data.Store',
    alias: 'widget.netzp-analytics-store-buergel',
    remoteSort: true,

    fields: [
        'score',
        'total',
        'orders'
    ],

    proxy: {
        type: 'ajax',

        url: '{url controller=NetzpBackendWidgets action=getBuergelStatistics}',

        reader: {
            type: 'json',
            root: 'data',
            totalProperty: 'total'
        }
    },
});
//{/block}