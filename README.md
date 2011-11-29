this little tiger allows me to do a `git push production master` and have the new code auto-deployed to production.

So, it relies on some conventions which you might not agree with and might not even be the best of ideas.  This fell very squarely in the 'simplest thing that could possible work' category.

Say you have a project `myproject.com`

- You have to have an upstart script: `/etc/init/myproject.com.conf`
- You have to have a repo at: `$HOME/repo/myproject.com`
- You have to have the code deployed at: `$HOME/src/web/myproject.com`

Yeah...not super portable...or really portable at all right now.  So far this is just my first crack at it.  It's working for me, and hopefully it will give you some ideas.

The cool thing about [pushover](https://github.com/substack/pushover) is it serves your repositories over http so you can have a tiny little git http server all nicely integrated with node.  And then you can use [node-git-emit](https://github.com/substack/node-git-emit) to write your post-receive hooks in node.  It's _great_.  You should check those modules out pronto.  
