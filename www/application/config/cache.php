<?php defined('SYSPATH') or die('No direct script access.');
return array (
	/*'file'    => array(
		'driver'             => 'file',
		'cache_dir'          => Kohana::$cache_dir,
		'default_expire'     => 3600,
	),
	'default'    => array(
		'driver'             => 'file',
		'cache_dir'          => APPPATH.'cache',
		'default_expire'     => 3600,
	)*/
    'default' => array(
        'driver' => 'smemcache',
        'compression' => false,
        'servers' => array(
            array(
                'host' => 'localhost',
                'port' => 11234,
                'persistent' => false
            )
        ),
        'default_expire' => 60,
        'requests' => 100
    )
);
