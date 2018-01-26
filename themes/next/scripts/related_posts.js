hexo.extend.helper.register('related_posts', function(currentPost, allPosts){
    var relatedPosts = [];
    currentPost.categories.forEach(function (category) {
        allPosts.forEach(function (post) {
            if (isTagRelated(category.name, post.categories)) {
                var relatedPost = {
                    title: post.title,
                    path: post.path,
                    weight: 1
                };
                var index = findItem(relatedPosts, 'path', post.path);
                if (index != -1) {
                    relatedPosts[index].weight += 1;
                } else{
                    if (currentPost.path != post.path) {
                        relatedPosts.push(relatedPost);
                    };
                };
            };
        });
    });
    if (relatedPosts.length == 0) {return ''};
    var result = '<h3> 相关文章：</h3><ul class="related-posts">';
    relatedPosts = relatedPosts.sort(compare('weight'));
    for (var i = 0; i < Math.min(relatedPosts.length, 10); i++) {
        result += '<li><a href="/' + relatedPosts[i].path + '">' + relatedPosts[i].title + '</a></li>';
    };
    result += '</ul>';
    // console.log(relatedPosts);
    return result;
});
hexo.extend.helper.register('echo', function(path){
  return path;
});
function isTagRelated (categoryName, categories) {
    var result = false;
    categories.forEach(function (category) {
        if (categoryName == category.name) {
            result = true;
        };
    })
    return result;
}
function findItem (arrayToSearch, attr, val) {
    for (var i = 0; i < arrayToSearch.length; i++) {
        if (arrayToSearch[i][attr] == val) {
            return i
        };
    };
    return -1;
}
function compare (attr) {
    return function (a, b) {
        var val1 = a[attr];
        var val2 = b[attr];
        return val2 - val1;
    }
}
