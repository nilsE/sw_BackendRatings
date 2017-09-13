

//{block name="backend/analytics/netzp_voucher_statistics/store/navigation/voucher"}
Ext.define('Shopware.apps.Analytics.netzpVoucherStatistics.store.navigation.Voucher', {
    extend: 'Ext.data.Store',
    alias: 'widget.netzp-analytics-store-voucher',
    remoteSort: true,

    fields: [
        'description',
        'vouchercode',
        'numberofunits',
        'percentguests',
        'guests',
        'validfrom',
        'validto',
        'value',
        'minimumcharge',
        'shippingfree',
        'averageamount',
        'cashedAll',
        'cashed0',
        'cashed1',
        'cashed2',
        'cashed3'
    ],

    proxy: {
        type: 'ajax',

        url: '{url controller=NetzpBackendWidgets action=getVoucherStatistics}',

        reader: {
            type: 'json',
            root: 'data',
            totalProperty: 'total'
        }
    },
});
//{/block}