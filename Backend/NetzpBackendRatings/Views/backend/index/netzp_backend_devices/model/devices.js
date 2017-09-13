Ext.define('Shopware.apps.Index.netzpBackendDevicesWidget.model.Devices', {
 
    extend: 'Ext.data.Model',
 
    fields: [
        { name: 'desktopVisits', type: 'number' },
        { name: 'tabletVisits', type: 'number' },
        { name: 'mobileVisits', type: 'number' }
    ],

    hasMany: {
        name: 'turnover',
        model: 'Shopware.apps.Index.netzpBackendDevicesWidget.model.Device',
    }
});
