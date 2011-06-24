<div id="masthead" class="container_16">
    <div class="grid_4">
        <h1 id="site-title">Sourcemap</h1>
        <a href="">        
            <img src="/assets/images/logo.png" alt="sourcemap" />
        </a>
    </div>
    <div id="header" class="grid_12">
        <ul class="nav">
            <li class="first">
                <a href="browse">Browse</a>            
            </li>
            <li>
                <a href="create">Create</a>
            </li>
            <li>
                <?php if($current_user = Auth::instance()->get_user()): // This happens if the user is logged in ?>
                    <a href="/home"><?= HTML::chars($current_user->username) ?></a>&nbsp;|&nbsp;<a href="auth/logout">Log out</a></span>
                <?php else:  // Otherwise, this ?>
                <a href="/register">Register</a> | <a href="auth">Log in</a>
                <?php endif; ?>
            </li>
        </ul>
        <form method="post" action="/search/">
            <fieldset>
                <button onclick="('masthead-search').submit(); return false;" id="search-button">
                    <span>Search</span>
                </button>
                <label>
                    <input id="search" name="q" type="search" results="0" />
                </label>
            </fieldset>
        </form>
        <div id="livesearch"></div>
    </div> <!-- #header -->
</div> <!-- #masthead -->

