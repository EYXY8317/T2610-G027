from flask import Blueprint, render_template

from Journal_Pages.journal_home_page.systems.streak_system import (
    get_current_streak,
    get_highest_streak
)

# Blueprint = Separate the homepage feature
# 把 homepage 功能分开管理

homepage_bp = Blueprint(
    'homepage',
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/homepage_static'
)

# ================= HOMEPAGE ROUTE =================

@homepage_bp.route('/homepage')
def homepage():

    # Get current streak
    # 获取目前 streak

    streak = get_current_streak()

    # Get highest streak
    # 获取最高 streak

    highest_streak = get_highest_streak()

    # ================= MOOD DATA =================

    # Example mood data
    # 示例 mood 数据

    happy_count = 0

    sad_count = 0

    angry_count = 0

    # Send data into HTML
    # 把数据传送去 HTML

    return render_template(

        'homepage.html',

        streak=streak,

        highest_streak=highest_streak,

        happy_count=happy_count,

        sad_count=sad_count,

        angry_count=angry_count
    )