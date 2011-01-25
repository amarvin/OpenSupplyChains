<?php
class Controller_Map extends Sourcemap_Controller_Layout {
    
    public $layout = 'map';
    public $template = 'map/view';
    
    public function action_view($supplychain_id) {
        $supplychain = ORM::factory('supplychain', $supplychain_id);
        if($supplychain->loaded()) {
            $current_user_id = (int)Auth::instance()->logged_in();
            $owner_id = (int)$supplychain->user_id;
            if($supplychain->user_can($current_user_id, Sourcemap::READ)) {
                $this->template->supplychain_id = $supplychain->id;
                $this->layout->scripts = array(
                    'modernizr', 'less', 'map-view', 'sourcemap-core', 
                    'sourcemap-template', 'sourcemap-working'
                );
                $this->layout->styles = array(
                    'assets/styles/style.css', 
                    'assets/styles/sourcemap.less?v=2'
                );
            } else {
                $this->request->status = 403;
                $this->layout = View::factory('layout/error');
                $this->template = View::factory('error');
                $this->template->error_message = 'This map is private.';
            }
        } else {
            $this->request->status = 404;
            $this->layout = View::factory('layout/error');
            $this->template = View::factory('error');
            $this->template->error_message = 'That map could not be found.';
        }
    }

    public function action_static($supplychain_id) {
        $supplychain = ORM::factory('supplychain', $supplychain_id);
        if($supplychain->loaded()) {
            $current_user_id = (int)Auth::instance()->logged_in();
            $owner_id = (int)$supplychain->user_id;
            if($supplychain->user_can($current_user_id, Sourcemap::READ)) {
                header('Content-Type: image/png');
                $cache_file = Kohana::$cache_dir.'static-map-'.$supplychain_id.'.png';
                if(file_exists($cache_file)) {
                    print file_get_contents($cache_file);
                    header('X-Cache-Hit: true');
                } else {
                    $img_data = CloudMade_StaticMap::get_image($supplychain->kitchen_sink($supplychain_id));
                    file_put_contents($cache_file, $img_data);
                    print $img_data;
                }
                exit;
            } else {
                $this->request->status = 403;
                $this->layout = View::factory('layout/error');
                $this->template = View::factory('error');
                $this->template->error_message = 'This map is private.';
            }
        } else {
            $this->request->status = 404;
            $this->layout = View::factory('layout/error');
            $this->template = View::factory('error');
            $this->template->error_message = 'That map could not be found.';
        }
    }
}
