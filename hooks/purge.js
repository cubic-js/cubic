class Purge {

    constructor(user) {
        this.user = user
    }

    /**
     * Remove unused users to reduce unnecessary storage usage
     */
    watch() {
        setInterval(() => {
            this.user.find({}).then(users => {
                users.forEach(user => {
                    if (user.last_ip.length < 2) {
                        if (new Date() - new Date(user.last_ip[0].accessed) > 604800000) {
                            this.remove(user.user_key)
                        }
                    }
                })
            })
        }, 3600000)
    }

    remove(key) {
        this.users.remove({user_key: key})
    }
}

module.exports = Purge
