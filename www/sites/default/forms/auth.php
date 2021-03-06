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

return array(
    'fields' => array(
        'username' => array(
            'type' => 'text',
            'label' => 'Username',
    		'attributes' => array(
    			'maxlength' => 55,
    		)
        ),
        'password' => array(
            'type' => 'password',
            'label' => 'Password',
    		'attributes' => array(
    			'maxlength' => 55,
    		)
        ),
        'auth' => array(
            'type' => 'submit',
            'label' => 'Login'
        )
    ),
    'messages_file' => 'forms/auth',
    'rules' => array(
        // TODO: wildcard
        //'*' => array(),
        'username' => array(
            array('not_empty')
        ),
        'password' => array(
            array('not_empty')
        )
    ),
    'filters' => array()
);
