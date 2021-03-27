const User = require('../users/user.entity');
const { Unauthorized, Locked } = require('http-errors')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    async validate(username, password) {
        const user = await User.findOne({ username });
        if(!user)
            throw new Unauthorized();

        if(user.isLocked)
            throw new Locked("The user is locked!");

        let payload = {successiveFailedLogins: user.successiveFailedLogins, isLocked: user.isLocked}

        if (!bcrypt.compareSync(password, user.password)) {
            payload.successiveFailedLogins++;
            if(payload.successiveFailedLogins >= 3){
                payload.isLocked = true;
            }
            payload = Object.assign(user, payload);
            await payload.save();
            
            if(user.isLocked)
                throw new Locked("The user is locked!");
            throw new Unauthorized();
        }
      
        payload.successiveFailedLogins = 0;
        payload = Object.assign(user, payload);
        await payload.save();

        return user;
    }

    async login(username, password) {
        const user = await this.validate(username, password);

        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        })

        return token;
    }

    validateToken(token) {
        const obj = jwt.verify(token, process.env.JWT_SECRET, {
            ignoreExpiration: true
        })

        return { userId: obj.userId, username: obj.username, role: obj.role };
    }
}

module.exports = new AuthService();