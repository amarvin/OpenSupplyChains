<?php
/**
 * Description
 * @package    Sourcemap
 * @author     Reed Underwood
 * @copyright  (c) Sourcemap
 * @license    http://blog.sourcemap.org/terms-of-service
 */
class Sourcemap_Controller_Service extends Controller_REST {
    
    public $_action_map = array(
        'GET' => 'get',
        'PUT' => 'put',
        'POST' => 'post',
        'DELETE' => 'delete',
        'HEAD' => 'head'
    );

    public $response = null;
    
    // Serialization parameters
    public $_format = 'json';
    public $_default_format = 'json';
    public $_default_content_type = 'text/plain';
    public $_jsonp_callback = 'console.log';
    public $_content_types = array(
        'json' => 'application/json',
        'jsonp' => 'text/javascript',
        'php' => 'application/vnd.php.serialized'
    );

    // Collection options
    public $_max_page_sz = 25;
    public $_default_page_sz = 25;
    public $_search_params = array();
    public $_sort_fields = array();

    public function before() {
        return parent::before();
    }

    public function after() {
        $this->request->response = $this->_serialize($this->response);
        $this->request->headers['Content-Type'] = 
            $this->_content_type($this->_format);
        return parent::after();
    }

    public function _list_parameters() {
        $l = isset($_GET['l']) ? (int)$_GET['l'] : $this->_default_page_sz;
        $o = isset($_GET['o']) ? (int)$_GET['o'] : 0;
        $l = $l > $this->_max_page_sz || !$l ? $this->_max_page_sz : $l;
        return (object)array(
            'limit' => $l, 'offset' => $o
        );
    }

    public function _serialization_formats() {
        $formats = array();
        $methods = get_class_methods(__CLASS__);
        foreach($methods as $i => $method) {
            if(preg_match('/^_serialize_(\w+)/', $method)) {
                $formats[] = str_replace('_serialize_', '', $method);
            }
        }
        return $formats;
    }

    public function _content_type($format=null) {
        $format = $format === null ? $this->_default_format : $format;
        if(isset($this->_content_types[$format])) {
            $content_type = $this->_content_types[$format];
        } else {
            $content_type = $this->_default_content_type;
        }
        return $content_type;
    }

    public function _serialize($data, $format=null) {
        static $formats = array();
        if(!$formats) $formats = $this->_serialization_formats();
        $format = $format === null ? $this->_format : $format;
        if(in_array($format, $formats)) {
            try {
                $serial = call_user_func(
                    array($this, '_serialize_'.$format), $data
                );
            } catch(Exception $e) {
                throw new Sourcemap_Exception_REST(
                    sprintf('Serialization error for format "%s".', $format)
                );
            }
        } else {
            throw new Sourcemap_Exception_REST(
                sprintf('Bad format "%s". (%s)', $format, join(',', $formats))
            );
        }
        return $serial;
    }

    public function _serialize_php($data) {
        return serialize($data);
    }

    public function _serialize_json($data) {
        return json_encode($data);
    }

    public function _serialize_jsonp($data, $callback=null) {
        $callback = $callback === null ? $this->_jsonp_callback : $callback;
        return sprintf('%s(%s);', $callback, $this->_serialize_json($data));
    }

    public function _rest_error($code=400, $msg='Not found.') {
        $this->request->status = $code;
        $this->headers['Content-Type'] = $this->_content_type();
        $this->response = array(
            'error' => $msg
        );
    }

    public function _not_found($msg='Not found.') {
        $this->_rest_error(404, $msg);
    }

}
