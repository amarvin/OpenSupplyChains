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

<fieldset>
<legend>Create a new user:</legend>
<form name="create-user" method="post" action="admin/users/create">
<label for="email">Email:</label><input type="text" name="email" />&nbsp;<label for="username">Username:</label><input type="text" name="username" />
<input type="submit" value="create" name="create-user" />
</form>
</fieldset>

<?= View::factory('partial/admin/list', array('list' => $users, 'list_type' => 'users')) ?>
<?php echo $page_links; ?>

<div class="export">
    <a href="admin/users/csv">Export this to CSV</a>
</div>
