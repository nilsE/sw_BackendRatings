Ext.define('Shopware.apps.Index.netzpBackendCurrentusersWidget.view.Main', {

    extend: 'Shopware.apps.Index.view.widgets.Base',
    alias: 'widget.netzp-backend-currentusers',
 
    minHeight: 250,
 
    initComponent: function() {
        var me = this;

        me.currentUsersStore = Ext.create('Shopware.apps.Index.netzpBackendCurrentUsersWidget.store.Currentusers').load({
            callback: function () {
                me.createColumnContainers();
                me.createTaskRunner();
            }
        });

        me.tools = [
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
            store = me.currentUsersStore;

        me.panel = me.add(Ext.create('Ext.container.Container', {
            id: 'chartcontainer-' + me.id,
            layout: 'absolute',
            height: '100%',
            items: me.createPieChart(store)
        }));
    },

    createPieChart: function (store) {
        var me = this;

        me.chart = Ext.create('Ext.chart.Chart', {
            xtype: 'chart',
            id: 'items-' + me.id,
            theme: 'Base:gradients',
            height: 200,
            animate: true,
            store: store,
            shadow: false,

            items: [
                {
                    type: 'text',
                    text: store.sum('count'),
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
                }
            ],

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
            
            legend: {
                visible: true,
                position: 'left',
                labelFont: '10px Arial'
            },

            series: [
                {
                    type: 'pie',
                    donut: 50,
                    field: 'count',
                    showInLegend: true,
                    colorSet: ['#008000', '#90EE90', '#32CD32'],

                    label: {
                        field: 'deviceType',
                        display: 'inside',
                        contrast: true,
                        font: '12px Arial',

                        renderer: function(item) {
                            var storeItem = store.findRecord('deviceType', item);
                            var total = store.sum('count');

                            return total > 0 ? Math.round(storeItem.get('count') / total * 100) + ' %' : '';
                        }

                    },

                    highlight: {
                        segment: {
                            margin: 15
                        }
                    },

                    tips: {
                        trackMouse: true,
                        width: 125,
                        height: 50,
                        renderer: function(storeItem, item) {
                            this.setTitle('<span style="font-size: 120%">' + storeItem.get('deviceType') + '</span><br>' + 
                                          '<span style="font-weight: normal">Besucher: ' + Math.round(storeItem.get('count')).toLocaleString() + '</span><br>');
                        }
                    }
                }
            ]
        });

        return [ me.chart ];
    },

    createTaskRunner: function () {
        var me = this;

        me.storeRefreshTask = Ext.TaskManager.start({
            scope: me,
            run: me.refreshView,
            interval: 60000
        });
    },

    refreshView: function() {
        var me = this;
 
        if(!me.currentUsersStore) {
            return;
        }
 
        me.panel.setLoading(true);
        me.currentUsersStore.load({
            callback: function() {
                Ext.getCmp('chartcontainer-' + me.id).destroy();
                me.createColumnContainers();
                me.panel.setLoading(false);
            }
        });
    }     
});