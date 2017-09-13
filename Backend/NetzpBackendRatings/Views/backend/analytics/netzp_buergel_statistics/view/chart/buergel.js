

//{namespace name=backend/analytics/view/main}
//{block name="backend/analytics/netzp_buergel_statistics/view/chart/buergel"}
Ext.define('Shopware.apps.Analytics.netzpBuergelStatistics.view.chart.Buergel', {
    extend: 'Shopware.apps.Analytics.view.main.Chart',
    alias: 'widget.analytics-chart-buergel',
    animate: true,
    shadows: true,

    legend: {
        position: 'right'
    },

    initComponent: function () {
        var me = this;

        me.series = [];

        me.axes = [
            {
                type: 'Numeric',
                position: 'left',
                fields: me.getAxesFields('total', 'orders'),
                title: 'Bürgel Scorings',
                grid: true,
                minimum: 0
            },
            {
                type: 'Category',
                position: 'bottom',
                fields: ['score'],
                title: 'Score'
            }
        ];

        me.legend = {
            position: 'right',

        },

        me.series = [
            {
                type: 'bar',
                highlight: true,
                column: true,
                stacked: false,
                showInLegend: true,
                
                xField: 'score',
                yField: ['total', 'orders'],

                title: ['Anzahl Scorings', 'Bestellungen'],
                colorSet: ['#FF0000', '#FF4500'],

                label: {
                    field: ['total', 'orders'],
                    display: 'insideEnd',
                    orientation: 'horizontal',
                    contrast: true,
                    'text-anchor': 'middle'
                },
            }
        ];

        me.callParent(arguments);
    }
});
//{/block}
