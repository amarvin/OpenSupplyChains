<?php if(!isset($current_user) || !$current_user): ?>
<div class="container">
    <div class="login-copy">
        <h1>Sign in to Sourcemap</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit amet ultrices neque.</p>
        <p>In pulvinar ipsum quis orci ornare non lobortis turpis tincidunt. Integer at ligula erat, in hendrerit risus. Vivamus mattis tempor accumsan. Integer dignissim felis eu lectus ultrices aliquet.</p>
        <p>Fusce ultricies pharetra eros, nec ornare magna auctor blandit. Fusce non risus non odio elementum mollis.</p>
        <div class="spacer">&nbsp;</div>
            <ul>
            <li><a href="/auth/forgot_password">Forgot your password?</a></li>
            <li><a href="/register">Register a new account</a></li>
        </ul>
    </div>
    <div class="login-box">
        <h1>&nbsp;</h1>
        <div class="sourcemap-form">
          <fieldset> 
            <form name="auth-login" class="form" method="post" action="auth/login">
                <label for="username">Username</label> 
                <div class="sourcemap-form-textbox username"> 
                    <input name="username" type="text" class="username" id="username" value="username" /> 
                </div> 
                <label for="password">Password</label> 
                <div class="sourcemap-form-textbox password"> 
                    <input name="password" type="password" class="password" id="password" value="password" /> 
                </div> 
                <?php if (isset($_GET['next'])): ?>
                    <input type="hidden" name="next" value="<?= $_GET['next']; ?>" /> 
                <?php endif; ?>
                <input name="Submit" type="submit" value="Login" class="button" /> 
            </form>
            </fieldset>
        </div>
    </div>
</div>

<div class="container">
<?php else: ?>
<h2>You&apos;re logged in as <?= $current_user->username ?>.</h2>
<?php endif; ?>
</div>
