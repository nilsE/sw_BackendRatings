Ext.define('Shopware.apps.Index.netzpBackendDevicesWidget.view.Main', {

    extend: 'Shopware.apps.Index.view.widgets.Base',
    alias: 'widget.netzp-backend-devices',
 
    minHeight: 250,
 
    initComponent: function() {
        var me = this;
 
        me.devicesStore = Ext.create('Shopware.apps.Index.netzpBackendDevicesWidget.store.Devices').load({
            callback: function () {
                me.createColumnContainers();
            }
        });

        me.tools = [
        {
            xtype: 'button',
            id: 'btnAll-' + me.id,
            tooltip: 'Alle verfügbaren Daten anzeigen',
            text: 'Gesamt',
            enableToggle: true,
            allowDepress: false,
            toggleGroup: 'rangebuttons',

            handler: function () {
                me.refreshView();
            }
        },
        {
            xtype: 'tbspacer',
            width: 10
        },
        {
            xtype: 'button',
            id: 'btnMonths-' + me.id,
            tooltip: 'Zeitraum 12 Monate',
            text: '12 Monate',
            style: 'border: 0',
            enableToggle: true,
            allowDepress: false,
            toggleGroup: 'rangebuttons',

            handler: function () {
                me.refreshView();
            }
        },
        {
            xtype: 'tbspacer',
            width: 10
        },
        {
            xtype: 'button',
            id: 'btnDays-' + me.id,
            tooltip: 'Zeitraum 30 Tage',
            text: '30 Tage',
            style: 'border: 0',
            enableToggle: true,
            allowDepress: false,
            pressed: true,
            toggleGroup: 'rangebuttons',

            handler: function () {
                me.refreshView();
            }
        }
        ];
 
        me.items = [];
 
        me.callParent(arguments);
    },

    createColumnContainers: function () {
        var me = this,
            store = me.devicesStore.first();

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
            theme: 'Base:gradients',
            height: 200,
            animate: true,
            store: store.turnover(),
            shadow: false,

            items: [
                {
                    type: 'text',
                    text: 'Besucher',
                    fill: '#dddddd',
                    font: '10px Arial',
                    x: 220,
                    y: 148
                },
                {
                    type: 'text',
                    text: 'Umsatz',
                    fill: '#dddddd',
                    font: '10px Arial',
                    x: 224,
                    y: 197
                },
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
                visible:true,
                position: 'left',
                labelFont: '10px Arial'
            },

            series: [
                {
                    type: 'pie',
                    donut: 70,
                    field: 'turnover',
                    showInLegend: true,
                    colorSet: ['#008000', '#90EE90', '#32CD32'],

                    label: {
                        field: 'deviceType',
                        display: 'inside',
                        contrast: true,
                        font: '12px Arial',

                        renderer: function(item) {
                            var storeItem = store.turnoverStore.findRecord('deviceType', item);

                            var total = 0;
                            store.turnoverStore.each(function(rec) {
                                total += Math.round(rec.get('turnover'));
                            });

                            return total > 0 ? Math.round(storeItem.get('turnover') / total * 100) + ' %' : '';
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
                                          '<span style="font-weight: normal">Umsatz: ' + Math.round(storeItem.get('turnover')).toLocaleString() + '</span><br>' +
                                          '<span style="font-weight: normal">Bestellungen: ' + Math.round(storeItem.get('orderCount')).toLocaleString() + '</span>');
                        }
                    }
                }
            ]
        });

        var totalVisits = store.data.desktopVisits + store.data.tabletVisits + store.data.mobileVisits,
            recDesktop = store.turnoverStore.findRecord('deviceType', 'desktop'),
            recTablet = store.turnoverStore.findRecord('deviceType', 'tablet'),
            recMobile = store.turnoverStore.findRecord('deviceType', 'mobile');


        var tempStore = Ext.create('Ext.data.JsonStore', {
            fields: ['deviceType', 'value', 'conversion', 'percentage'],
            data: [
                { 
                    'deviceType': 'desktop',
                    'value': store.data.desktopVisits,
                    'percentage': Math.round(store.data.desktopVisits / totalVisits * 100),
                    'conversion': recDesktop ? Math.round(recDesktop.get('orderCount') / store.data.desktopVisits * 100) : 0
                },
                { 
                    'deviceType': 'tablet', 
                    'value': store.data.tabletVisits,
                    'percentage': Math.round(store.data.tabletVisits / totalVisits * 100),
                    'conversion': recTablet ? Math.round(recTablet.get('orderCount') / store.data.tabletVisits * 100) : 0
                },
                { 
                    'deviceType': 'mobile', 
                    'value': store.data.mobileVisits,
                    'percentage': Math.round(store.data.mobileVisits / totalVisits * 100),
                    'conversion': recMobile ? Math.round(recMobile.get('orderCount') / store.data.mobileVisits * 100) : 0 
                },
            ]
        });

        me.chart2 = Ext.create('Ext.chart.Chart', {
            xtype: 'chart',
            theme: 'Base:gradients',
            height: 110,
            x:  38,
            y:  50,
            animate: true,
            store: tempStore,
            shadow: false,

            listeners: {
                afterrender: function (chartCmp) {
                    var timeout = setTimeout(function () {
                        chartCmp.setWidth(chartCmp.ownerCt.getWidth());

                        clearTimeout(timeout);
                        timeout = null;
                    }, 5);
                }
            },
            
            legend: {
                visible:false,
            },

            series: [
                {
                    type: 'pie',
                    donut: 40,
                    field: 'percentage',
                    showInLegend: false,
                    colorSet: ['#008000', '#90EE90', '#32CD32'],

                    label: {
                        field: 'deviceType',
                        display: 'inside',
                        contrast: true,
                        font: '12px Arial',

                        renderer: function(item) {
                            var storeItem = tempStore.findRecord('deviceType', item);
                            return storeItem.get('percentage') + ' %';
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
                                          '<span style="font-weight: normal">Besucher: ' + Math.round(storeItem.get('value')).toLocaleString() + '</span><br>' + 
                                          '<span style="font-weight: normal">Konversion: ' + storeItem.get('conversion') + ' %</span>');
                        }
                    }
                }
            ]
        });
        

        return [ me.chart, me.chart2 ];
    },

    refreshView: function() {
        var me = this;
 
        if(!me.devicesStore) {
            return;
        }
 
        var btnAll = Ext.getCmp('btnAll-' + me.id),
            btnMonths = Ext.getCmp('btnMonths-' + me.id),
            btnDays = Ext.getCmp('btnDays-' + me.id),
            range = 0;

        if(btnAll.pressed) {
            range = 3;
        }
        else if(btnMonths.pressed) {
            range = 2;
        }  
        else if(btnDays.pressed) {
            range = 1;
        }

        me.panel.setLoading(true);
        me.devicesStore.load({
            
            params: {
                range: range,
            },

            callback: function() {
                Ext.getCmp('chartcontainer-' + me.id).destroy();
                me.createColumnContainers();
                me.panel.setLoading(false);
            }
        });
    }
});