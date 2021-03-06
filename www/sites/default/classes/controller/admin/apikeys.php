<?php
/* Copyright (C) Sourcemap 2011
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License along with this
 * program. If not, see <http://www.gnu.org/licenses/>.*/

class Controller_Admin_APIKeys extends Controller_Admin {

    public $layout = 'admin';
    public $template = 'admin/apikeys/list';


    public function action_index() {

        $apikeys = ORM::factory('user_apikey');
        $page = max($this->request->param('page'), 1);
        $items = 20;
        $offset = ($items * ($page - 1));
        $count = $apikeys->count_all();
        $pagination = Pagination::factory(array(
            'current_page' => array(
                'source' => 'query_string', 
                'key' => 'page'
                ),
            'total_items' => $apikeys->count_all(),
            'items_per_page' => $items,
        ));
        
        $apikeysa = $apikeys->order_by('created', 'desc')
            ->limit($pagination->items_per_page)
            ->offset($pagination->offset)
            ->find_all()
            ->as_array('apikey', true);

        $apikeyowners = $apikeys->user->find_all()->as_array('id', true);
        foreach($apikeysa as $i => $apikey) {
            $apikeysa[$i]->owner = (object)$apikeyowners[$apikey->user_id];
        }

        $this->template->apikeys = $apikeysa;
        $this->template->page_links = $pagination->render();
        $this->template->offset = $pagination->offset;
        
        Breadcrumbs::instance()->add('Management', 'admin/')
            ->add('API Keys', 'admin/apikeys');
    }

    public function action_add() {
        $post = Validate::factory($_POST)
            ->rule('user_id', 'not_empty');
        if($post->check()) {
            $user_id = $post['user_id'];
            $user = ORM::factory('user', $user_id);
            if($user->loaded()) {
                $newkey = md5(sprintf('%s-%s-%s', $user->id, $user->email, microtime()));
                $newsecret = md5(sprintf('%s-%s-%s-%s', microtime(), $user->email, $user->id, $newkey));
                $apikey = ORM::factory('user_apikey');
                $apikey->apikey = $newkey;
                $apikey->apisecret = $newsecret;
                $apikey->user_id = $user->id;
                $apikey->save();
                Message::instance()->set(sprintf('Added api key for "%s".', $user->username));
            } else {
                Message::instance()->set('Could not add api key: invalid user.', Message::ERROR);
            }
        } else {
            Message::instance()->set('Missing or invalid user id.', Message::ERROR);
        }
        $this->request->redirect('admin/apikeys');
    }
}
