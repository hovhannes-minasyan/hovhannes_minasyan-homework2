const { Forbidden, Locked } = require('http-errors');
const { validateToken } = require('../../auth/auth.service');
const users = require('../../users/users.service');

module.exports = {
    jwtMiddleware(req, res, next) {
        if(req.method == "POST" && (req.path == "/auth/login" || req.path == "/users")){
            return next();
        }

        let token;
        try {
            token = req.header('Authorization').split(' ')[1];
            const user = validateToken(token);

            const userObj = users.findOne({_id:user.id});
            if(userObj.isLocked)
                return next(new Locked("The user is locked!"));
            req.user = user;
        } catch (err) {
            return next(new Forbidden());
        }

        next();
    }
}