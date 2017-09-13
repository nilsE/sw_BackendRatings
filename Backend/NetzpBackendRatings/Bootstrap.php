<?php
/**
* NetzpBackendRatings
* Backend-Widget zur Anzeige von Produktbewertungen
* Historie:
* - 1.0.0               Initiale Version
* - 1.0.1               Fehlerbehebung Legende
* - 1.0.2   01.11.2016  Neues Widget: Bestellungen nach Gerätetyp
*           05.11.2016  Neues Widget: Aktuelle Besucher nach Gerätetyp
* - 1.0.3   11.11.2016  Backend-Report: Auswertung Gutscheine nach Bestellungen
* - 1.0.4   17.01.2016  Bugfix: mehrfaches Hinzufügen von Widgets möglich
* - 1.0.5   23.01.2017  Auswertung für Bürgel-Scoring (AeronisBuergel)
* - 1.0.6   14.06.2017  Kompatibilität für SW 5.3
**/

class Shopware_Plugins_Backend_NetzpBackendRatings_Bootstrap extends Shopware_Components_Plugin_Bootstrap
{
    const AD_URL = "https://sws.netzperfekt.de/api/snippet/ad-shopmanager";

    public function getCapabilities()
    {
        return array(
            'install' => true,
            'enable' => true,
            'update' => true
        );
    }
 
    public function getVersion()
    {
        return '1.0.6';
    }
 
    public function getLabel()
    {
        return 'Backend-Widget für Produkt-Bewertungen';
    }
 
    public function getInfo() {

        return array(
            'version' => $this->getVersion(),
            'label' => $this->getLabel(),
            'description' => 'Backend Widget-Sammlung',
            'author' => 'netzperfekt',
            'link' => 'http://netzperfekt.de',
            'support' => 'http://www.netzperfekt.de/support'
        );
    }
 
    public function update($version)
    {
        return true;
    }

    public function install()
    {
        if (!$this->assertVersionGreaterThen('5.0.0')) {
            throw new Exception('Dieses Plugin benötigt Shopware ab Version 5.0.0');
        }

        $this->createWidgets();
        $this->createConfiguration();
        $this->subscribeEvents();

        return true;
    }

    public function uninstall()
    {
        $this->removeWidgets();

        return true;
    }

    function createWidgets() {

        if ( ! Shopware()->Db()->fetchOne("SELECT id FROM s_core_widgets WHERE name = ?", array('netzp-backend-ratings'))) {
            $this->createWidget('netzp-backend-ratings');
        }
        if ( ! Shopware()->Db()->fetchOne("SELECT id FROM s_core_widgets WHERE name = ?", array('netzp-backend-devices'))) {
            $this->createWidget('netzp-backend-devices');
        }
        if ( ! Shopware()->Db()->fetchOne("SELECT id FROM s_core_widgets WHERE name = ?", array('netzp-backend-currentuser'))) {
            $this->createWidget('netzp-backend-currentusers');
        }
    }

    function removeWidgets() {

        Shopware()->Db()->query("DELETE FROM s_core_widgets WHERE name = ?", array('netzp-backend-ratings'));
        Shopware()->Db()->query("DELETE FROM s_core_widgets WHERE name = ?", array('netzp-backend-devices'));
        Shopware()->Db()->query("DELETE FROM s_core_widgets WHERE name = ?", array('netzp-backend-currentusers'));
    }

    private function adFrame()
    {
        return '<iframe src="' . self::AD_URL . '" frameborder="0" width="100%" height="100%"></iframe>';
    }

    private function createConfiguration() 
    {
        $form = $this->Form();

        $form->setElement('text', 'ad', array(
            'label'         => $this->adFrame(),
            'value'         => '',
            'fieldStyle'    => 'display: none; width: 0',
            'labelSeparator'=> '',
            'labelAlign'    => 'left',
            'labelWidth'    => '100%'
        ));

        $form->save();
    }

    function subscribeEvents() {

        $this->registerController('Backend', 'NetzpBackendWidgets');

        $this->subscribeEvent('Enlight_Controller_Action_PostDispatch_Backend_Index', 'onPostDispatchBackendIndex');
        $this->subscribeEvent('Enlight_Controller_Action_PostDispatch_Backend_Analytics', 'onPostDispatchBackendAnalytics');
    }
 
    public function onPostDispatchBackendIndex(Enlight_Event_EventArgs $args)
    {
        $request = $args->getRequest();
        $view = $args->getSubject()->View();
 
        $view->addTemplateDir($this->Path() . 'Views/');
 
        if ($request->getActionName() === 'index') {
            $view->extendsTemplate('backend/index/netzp_backend_ratings/app.js');
            $view->extendsTemplate('backend/index/netzp_backend_devices/app.js');
            $view->extendsTemplate('backend/index/netzp_backend_currentusers/app.js');
        }
    }

    public function onPostDispatchBackendAnalytics(Enlight_Event_EventArgs $args)
    {
        $request = $args->getRequest();
        $view = $args->getSubject()->View();

        $view->addTemplateDir($this->Path() . 'Views/');

        if ($request->getActionName() === 'index') {
            $view->extendsTemplate('backend/analytics/netzp_voucher_statistics/app.js');

			if ($this->assertRequiredPluginsPresent(array('AeronicsBuergel'))) {
			    $view->extendsTemplate('backend/analytics/netzp_buergel_statistics/app.js');
			}
        }

        if ($request->getActionName() === 'load') {
            $view->extendsTemplate('backend/analytics/netzp_voucher_statistics/store/navigation.js');
            
			if ($this->assertRequiredPluginsPresent(array('AeronicsBuergel'))) {
			    $view->extendsTemplate('backend/analytics/netzp_buergel_statistics/store/navigation.js');
			}
        }
    }    
}
