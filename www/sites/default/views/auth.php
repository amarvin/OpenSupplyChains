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
?>

<div id="page-title">
    <div class="container">
        <h1>Sign in to Sourcemap</h1>
    </div>
</div>

<div class="container form-page">
    <div class="copy-section">
        <p>Sign in to create sourcemaps, leave comments, save favorites, and stay informed about our work.</p>
        <ul>
            <li><a href="/auth/forgot">Forgot your username or password?</a></li>
            <li><a href="/register">Register a new account</a></li>
        </ul>
    </div>
    <div class="box-section">
        <div class="sourcemap-form">
            <?= $login_form ?>
        </div>
    </div>
    <div class="clear"></div>
</div>
