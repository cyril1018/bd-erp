var hookEnterAsTab = function () {
    $('body').on('keydown', 'input, select', function (e) {
        if (e.key === "Enter") {
            var self = $(this), el = self.closest('div#app'), focusable, next;
            focusable = el.find('input,select,textarea').filter(':visible');
            let hookEnterAsTabKey = focusable.index(this);
            next = focusable.eq(hookEnterAsTabKey + 1);
            if (next.length) {
                next.focus();
                if (next.is('input')) {
                    next[0].select();
                }
            }
            return false;
        }
    });
}
