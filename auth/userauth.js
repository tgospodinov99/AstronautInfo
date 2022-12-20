const isAuth = (req, res, next) => {
    if(req.session.isAuth){
      next();
    } else {
      res.redirect('/users/login');
    }
  }

  module.exports = isAuth;