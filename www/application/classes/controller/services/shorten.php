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

class Controller_Services_Shorten extends Controller_Services {
    public function action_get() {        
        if(isset($_GET['url'])) {
            $this->response = Sourcemap_Bitly::shorten($_GET['url']);
            if(!$this->response) {
                return $this->_bad_request("Request failed.");
            }
        } else {
            return $this->_bad_request("Url required.");
        }
    }
}
