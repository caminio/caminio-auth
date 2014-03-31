module.exports = function( t ){

  t.authentication_failed = 'Authentifizierung fehlgeschlagen!';
  t.currently_logged_in = 'Dieses Konto ist momentan angemeldet!';
  t.insufficent_rights = 'Unzureichende Rechte!';

  t.user_unknown = 'Authentifizierung fehlgeschlagen';
  t.auth = t.auth || {};
  t.auth.title = 'Login erforderlich';
  t.auth.email_address = 'Email addresse';
  t.auth.mailer = t.auth.mailer || {};
  t.auth.mailer.subject_reset_password = 'Passwort zurücksetzen';
  t.auth.mailer.subject_pwd_changed = 'Passwort wurde geändert';
  t.auth.mailer.subject_welcome = 'Willkommen auf caminio!';
  t.auth.link_has_been_sent = 'Eine Email wurde an __email__ versendet';
  t.auth.security_transgression = 'Zugriffsrechteverletzung!';

  t.setup = t.setup || {};
  t.setup.title = 'Initial setup';
  t.setup.desc = 'This is the first time you launch this application. You should start with creating an administrator account';
  t.setup.name = 'Your organization name';
  t.setup.choose_email = 'Administrator\'s email address';
  t.setup.choose_pwd = 'Administrator\'s password';
  t.setup.domain_name = 'Domain name';
  t.setup.create = 'Create Account';
  t.setup.domain_name_desc = 'Domain name';
  t.setup.fill_in_all_fields = 'Please fill in all fields';
  t.setup.successful = 'Setup successfully completed';
  t.setup.already_initialized = 'Setup has already been ran on this application instance';

  t.user_unknown = 'Invalid email address or password';

  t.username_email = 'Username';
  t.password = 'Password';
  t.login = 'Login';
  t.send_email = 'Send email';
  t.forgotten_password = 'Forgotten password?';
  t.enter_email = 'Email address';
  t.remember_your_email = 'If you remember your Email address, you can request a link to reset your password.';
  t.request_link = 'Request link';
  t.user_unknown = 'Login failed! - User unkown';
  t.toggle_sidebar = 'Toggle sidebar';
  t.logout = 'Logout';

};