<?php

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder as DBALQueryBuilder;
use Shopware\Components\Model\DBAL\Result;

class Shopware_Controllers_Backend_NetzpBackendWidgets extends Shopware_Controllers_Backend_ExtJs
{
    protected $connection;

    public function getBuergelStatisticsAction()
    {
        $sql = 'SELECT IF(score = -1, -1, round(score/10)) score,

                (SELECT count(buergel_scores.id) 
                    FROM buergel_scores 
                    WHERE IF(score=-1,-1,round(score/10)) = IF(s1.score=-1,-1,round(s1.score/10))) total,

                (SELECT count(buergel_scores.id) 
                    FROM buergel_scores 
                    JOIN s_order_billingaddress 
                    ON buergel_scores.billingaddressID = s_order_billingaddress.id
                    WHERE IF(score=-1,-1,round(score/10)) = IF(s1.score=-1,-1,round(s1.score/10))
                ) orders

                FROM buergel_scores s1
                GROUP BY round(score/10)
                ORDER BY score ASC
        ';

        $data = Shopware()->Db()->fetchAll($sql);

        $this->View()->assign(array(
            'success' => true,
            'data'    => array_values($data),
            'count'   => count($data)
        ));
    }

    public function getVoucherStatisticsAction()
    {
        $limitOrders = 3;
        $data = array();

        $sql0 = 'SELECT description, ordercode, numberofunits, valid_from, valid_to, value, minimumcharge, shippingfree
                 FROM   s_emarketing_vouchers
                 WHERE  modus = 0 AND numberofunits > 1
                 ORDER  BY valid_from, valid_to, description
        ';
        $voucherCodes = Shopware()->Db()->fetchAll($sql0);

        foreach ($voucherCodes as $code) {
            $description = $code['description'];
            $voucherCode = $code['ordercode'];
            $validFrom = $code['valid_from'];

            // all users (registered + guests)
            $sql1 = 'SELECT s_order_details.articleordernumber, s_user.email, s_user_billingaddress.*, s_order.*
                     FROM   s_order_details 
                     LEFT JOIN s_order ON s_order_details.orderID = s_order.ID
                     LEFT JOIN s_user  ON s_order.userID = s_user.id
                     LEFT JOIN s_user_billingaddress ON s_user.id = s_user_billingaddress.userID
                     WHERE  s_order_details.ordernumber > 0 
                       AND  s_order.status >= 0
                       AND  s_order_details.articleordernumber LIKE ?
            ';

            $params = array($voucherCode);
            if($validFrom != null) {
                $sql1 .= ' AND s_order.ordertime >= ?';           
                $params[] = $validFrom;
            }
            $ordersWithVoucherCode = Shopware()->Db()->fetchAll($sql1, $params);

            // guest users
            $sql1a = 'SELECT s_order_details.articleordernumber, s_user.email, s_user_billingaddress.*, s_order.*
                      FROM   s_order_details 
                      LEFT JOIN s_order ON s_order_details.orderID = s_order.ID
                      LEFT JOIN s_user  ON s_order.userID = s_user.id
                      LEFT JOIN s_user_billingaddress ON s_user.id = s_user_billingaddress.userID
                      WHERE  s_order_details.ordernumber > 0 
                        AND  s_order.status >= 0
                        AND  s_user.accountmode = 1
                        AND  s_order_details.articleordernumber LIKE ?
            ';

            $params = array($voucherCode);
            if($validFrom != null) {
                $sql1a .= ' AND s_order.ordertime >= ?';           
                $params[] = $validFrom;
            }
            $guestOrdersWithVoucherCode = Shopware()->Db()->fetchAll($sql1a, $params);

            $dataCashed = array();
            $averageAmount = array();
            foreach ($ordersWithVoucherCode as $result1) {

                $sql2 = 'SELECT orderpos FROM (
                            SELECT @row := @row+1 as orderpos, ordernumber 
                            FROM s_order
                            JOIN (SELECT @row := 0) r
                            WHERE userID = ? 
                              AND ordernumber > 0
                              AND status >= 0
                            GROUP BY ordernumber
                            ORDER BY ordertime
                            LIMIT 0, '.$limitOrders.'
                         ) orders
                         WHERE ordernumber = ?  
                ';

                $orderCount = (int)Shopware()->Db()->fetchOne($sql2, array(
                    $result1['userID'], 
                    $result1['ordernumber'],
                ));

                $sql3 = 'SELECT invoice_amount - invoice_shipping FROM s_order WHERE userID = ? AND status >= 0 AND ordernumber = ?';
                $invoiceAmount = Shopware()->Db()->fetchOne($sql3, array(
                    $result1['userID'], 
                    $result1['ordernumber'],
                ));

                $customer = array(
                    'customernumber'    => $result1['customernumber'],
                    'salutation'        => $result1['salutation'],
                    'firstname'         => $result1['firstname'],
                    'lastname'          => $result1['lastname'],
                    'city'              => $result1['city'],
                    'email'             => $result1['email'],
                );
                $order = array(
                    'ordernumber'       => $result1['ordernumber'],
                    'ordercount'        => $orderCount
                );

                $dataCashed[$orderCount] += 1;
                $averageAmount[] = $invoiceAmount;
            }

            $tmp = array(
                'description'   => $description,
                'vouchercode'   => $voucherCode,
                'numberofunits' => $code['numberofunits'],
                'validfrom'     => $code['valid_from'],
                'validto'       => $code['valid_to'],
                'value'         => $code['value'],
                'minimumcharge' => $code['minimumcharge'],
                'shippingfree'  => $code['shippingfree'],
                'averageamount' => round(array_sum($averageAmount) / count($averageAmount), 2)
            );
            for($i = 0; $i <= $limitOrders; $i++) {
                $tmp['cashed'.$i] = 0;
            }
            $totalCashed = 0;
            foreach ($dataCashed as $key => $value) {
                $tmp['cashed'.$key] = $value;
                $totalCashed += $value;
            }
            $tmp['cashedAll']  = $totalCashed;
            $tmp['guests'] = count($guestOrdersWithVoucherCode);
            $tmp['percentguests'] = round(count($guestOrdersWithVoucherCode) / $totalCashed * 100);

            if($totalCashed > 0) {
                $data[] = $tmp;
            }
        }

        $this->View()->assign(array(
            'success' => true,
            'data'    => array_values($data),
            'count'   => count($data)
        ));
    }

    public function getCurrentUsersAction()
    {
        $sql = 'SELECT COUNT(DISTINCT remoteaddr) count, deviceType FROM s_statistics_currentusers WHERE time > DATE_SUB(NOW(), INTERVAL 3 MINUTE) GROUP BY deviceType';
        $result = Shopware()->Db()->fetchAll($sql);

        $userData = array(
            'desktop' => array('deviceType' => 'desktop', 'count' => 0),
            'tablet'  => array('deviceType' => 'tablet',  'count' => 0),
            'mobile'  => array('deviceType' => 'mobile',  'count' => 0),
        );

        foreach($result as $record) {
            if($record['deviceType'] == 'desktop' || 
               $record['deviceType'] == 'tablet' ||
               $record['deviceType'] == 'mobile') {
                $userData[$record['deviceType']] = $record;
            }
        }

        $this->View()->assign(array(
            'success' => true,
            'data'    => array_values($userData),
            'total'   => count($result)
        ));
    }

    public function getDevicesAction()
    {
        $range = (int)$this->Request()->getParam('range');

        $now = new \DateTime('now');
        $setRange = false;
        if ($range <= 1) { // nothing set or 30 days
            $dFrom = clone $now; $dTo = clone $now;
            $dFrom->sub(new DateInterval('P30D'));
            $setRange = true;
        }
        else if ($range == 2) { // 12 months
            $dFrom = clone $now; $dTo = clone $now;
            $dFrom->sub(new DateInterval('P12M'));
            $setRange = true;
        }
        else if ($range == 3) { // all data
            $setRange = false;
        }

        /* visitors by device types */
        $builder1 = Shopware()->Container()->get('dbal_connection')->createQueryBuilder();
        $builder1->select(array(
            'visitors.datum',
            'SUM(CASE WHEN deviceType = "desktop" THEN pageimpressions ELSE 0 END) as desktopImpressions',
            'SUM(CASE WHEN deviceType = "tablet" THEN pageimpressions ELSE 0 END) as tabletImpressions',
            'SUM(CASE WHEN deviceType = "mobile" THEN pageimpressions ELSE 0 END) as mobileImpressions',
            'SUM(visitors.pageimpressions) AS totalImpressions',
            'SUM(CASE WHEN deviceType = "desktop" THEN uniquevisits ELSE 0 END) as desktopVisits',
            'SUM(CASE WHEN deviceType = "tablet" THEN uniquevisits ELSE 0 END) as tabletVisits',
            'SUM(CASE WHEN deviceType = "mobile" THEN uniquevisits ELSE 0 END) as mobileVisits',
            'SUM(visitors.uniquevisits) AS totalVisits'
        ));

        $builder1->from('s_statistics_visitors', 'visitors')
                 ->leftJoin('visitors', 's_core_shops', 'shops', 'visitors.shopID = shops.id');

        if ($setRange) {
            $builder1->where('visitors.datum >= :fromDate')
                     ->andWhere('visitors.datum <= :toDate')
                     ->setParameter('fromDate', $dFrom->format("Y-m-d H:i:s"))
                     ->setParameter('toDate', $dTo->format("Y-m-d H:i:s"));
        }

        $result1 = new Result($builder1);
        $data1 = $result1->getData();

        /* turnover, ordercount by device types */

        $builder = Shopware()->Container()->get('dbal_connection')->createQueryBuilder();
        $builder->select(array(
            'COUNT(orders.id) AS orderCount',
            'SUM(orders.invoice_amount / orders.currencyFactor) AS turnover'
        ));

        $builder->from('s_order', 'orders')
            ->leftJoin('orders', 's_premium_dispatch', 'dispatch', 'orders.dispatchID = dispatch.id')
            ->leftJoin('orders', 's_core_paymentmeans', 'payment', 'orders.paymentID = payment.id')
            ->innerJoin('orders', 's_order_billingaddress', 'billing', 'orders.id = billing.orderID')
            ->innerJoin('billing', 's_core_countries', 'country', 'billing.countryID = country.id')
            ->where('orders.status NOT IN (4, -1)');

        if ($setRange) {
            $builder->andWhere('orders.ordertime >= :fromDate')
                    ->andWhere('orders.ordertime <= :toDate')
                    ->setParameter('fromDate', $dFrom->format("Y-m-d H:i:s"))
                    ->setParameter('toDate', $dTo->format("Y-m-d H:i:s"));
        }
        
        $builder->addSelect('orders.deviceType')
            ->groupBy('orders.deviceType')
            ->orderBy('turnover', 'DESC');


        $result = new Result($builder);
        $turnoverData = array(
            'desktop' => array('deviceType' => 'desktop', 'orderCount' => 0, 'turnover' => 0.0),
            'tablet'  => array('deviceType' => 'tablet',  'orderCount' => 0, 'turnover' => 0.0),
            'mobile'  => array('deviceType' => 'mobile',  'orderCount' => 0, 'turnover' => 0.0),
        );

        foreach($result->getData() as $record) {
            if($record['deviceType'] == 'desktop' || 
               $record['deviceType'] == 'tablet' ||
               $record['deviceType'] == 'mobile') {
                $turnoverData[$record['deviceType']] = $record;
            }
        }

        $this->View()->assign(array(
            'success' => true,
            'data'    => array(
                            'desktopVisits' => $data1[0]['desktopVisits'],
                            'tabletVisits'  => $data1[0]['tabletVisits'],
                            'mobileVisits'  => $data1[0]['mobileVisits'],
                            'turnover'      => array_values($turnoverData)
                        ),
            'total'   => $result->getTotalCount()
        ));
    }

    public function getRatingsAction()
    { 
        $sql1 = "SELECT ceil(points) AS points, count(id) AS count FROM s_articles_vote GROUP BY ceil(points)";
        $ratings = Shopware()->Db()->fetchAll($sql1);

        $sql2 = "SELECT count(id) AS count FROM s_articles_vote WHERE active = 0";
        $open = Shopware()->Db()->fetchOne($sql2);

        $copy = array('1' => 0, '2' => 0, '3' => 0, '4' => 0, '5' => 0);
        foreach($ratings as $rating) {
            $copy[$rating['points']] = $rating['count'];
        }

        $copy2 = array();
        foreach($copy as $points => $count) {
            $copy2[] = array('points' => $points, 'count' => $count);
        }

        $this->View()->assign(array(
            'success' => true,
            'data'    => array(
                'open'      => $open,
                'ratings'   => $copy2
            )
        ));
    }
}
