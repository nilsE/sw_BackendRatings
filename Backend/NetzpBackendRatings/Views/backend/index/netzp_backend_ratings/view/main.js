Ext.define('Shopware.apps.Index.netzpBackendRatingsWidget.view.Main', {

    extend: 'Shopware.apps.Index.view.widgets.Base',
    alias: 'widget.netzp-backend-ratings',
 
    minHeight: 250,
 
    initComponent: function() {
        var me = this;
 
        me.ratingsStore = Ext.create('Shopware.apps.Index.netzpBackendRatingsWidget.store.Ratings').load({
            callback: function () {
                me.createColumnContainers();
            }
        });

        me.tools = [
        {
            xtype: 'button',
            tooltip: 'Bewertungen aufrufen',
            text: 'Bewertungen aufrufen',
            style: 'border: 0',

            handler: function () {
                Shopware.app.Application.addSubApplication({
                    name: 'Shopware.apps.Vote'
                });
            }
        },
        {
            xtype: 'tbspacer',
            width: 10
        },
        {
            type: 'refresh',
            scope: me,
            handler: me.refreshView
        }
        ];
 
        me.items = [];
 
        me.callParent(arguments);
    },

    createColumnContainers: function () {
        var me = this,
            store = me.ratingsStore.first();

        me.panel = me.add(Ext.create('Ext.container.Container', {
            id: 'chartcontainer-' + me.id,
            columnWidth: 1.0,
            height: '100%',
            items: [
                me.createPieChart(store),
            ]
        }));
    },

    createPieChart: function (store) {
        var me = this;

        me.chart = Ext.create('Ext.chart.Chart', {
            xtype: 'chart',
            theme: 'Base:gradients',
            height: 200,
            animate: true,
            store: store.ratings(),
            shadow: false,

            listeners: {
                /**
                 * The method gets the width of the overlying container
                 * to propertly set the width of the chart.
                 */
                afterrender: function (chartCmp) {

                    // The timeout is kinda dirty, i know, but there's no way around it...
                    var timeout = setTimeout(function () {
                        chartCmp.setWidth(chartCmp.ownerCt.getWidth());

                        clearTimeout(timeout);
                        timeout = null;
                    }, 5);
                }
            },
            
            items : [
                {
                    type: 'text',
                    text: store.ratings().sum('count'),
                    fill: '#ffffff',
                    font: '20px Arial',
                    'text-anchor':'middle',
                    x: 242,
                    y: 95
                },
                {
                    type: 'text',
                    text: 'Gesamt',
                    fill: '#dddddd',
                    font: '12px Arial',
                    'text-anchor':'middle',
                    x: 242,
                    y: 117
                },
                {
                    type: 'text',
                    text: 'Offen: ' + store.data.open,
                    fill: '#ffffff',
                    font: '20px Arial',
                    x: 12,
                    y: 183
                },

            ],

            legend: {
                    visible:true,
                    position: 'left',
                    labelFont: '10px Arial'
            },

            series: [
                {
                    type: 'pie',
                    donut: 50,
                    field: 'count',
                    showInLegend: true,
                    title: ['1 Stern', '2 Sterne', '3 Sterne', '4 Sterne', '5 Sterne'],
                    colorSet: ['#FF0000', '#FF4500', '#008000', '#90EE90', '#32CD32'],

                    label: {
                        field: 'points',
                        display: 'inside',
                        contrast: true,
                        font: '12px Arial',
                        renderer: function(item) {
                            var storeItem = store.ratingsStore.findRecord('points', item);
                            if(storeItem.data.count == 0) {
                                return "";
                            }
                            else {
                               return storeItem.data.count;
                            }
                        }
                    },

                    highlight: {
                        segment: {
                            margin: 15
                        }
                    },
            
                    tips: {
                        trackMouse: true,
                        width: 200,
                        height: 25,
                        renderer: function(storeItem, item) {
                            this.setTitle(storeItem.get('points') + ' Sterne: ' + storeItem.get('count') + ' Bewertungen.');
                        }
                    }
                }
            ]
        });

        return me.chart;
    },

    refreshView: function() {
        var me = this;
 
        if(!me.ratingsStore) {
            return;
        }
 
        me.panel.setLoading(true);
        me.ratingsStore.load({
            callback: function() {
                Ext.getCmp('chartcontainer-' + me.id).destroy();
                me.createColumnContainers();
                me.panel.setLoading(false);
            }
        });
    }
});