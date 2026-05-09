from datetime import datetime, timedelta

from Journal_Pages.diary_system.crud import load_entries


def get_current_streak():

    entries = load_entries()

    if not entries:
        return 0

    dates = []

    for entry in entries:

        date_object = datetime.strptime(
            entry["date"],
            "%d/%m/%Y"
        ).date()

        dates.append(date_object)

    dates.sort(reverse=True)

    today = datetime.today().date()

    latest_date = dates[0]

    difference_from_today = today - latest_date

    if difference_from_today > timedelta(days=1):
        return 0

    streak = 1

    for i in range(len(dates) - 1):

        current_day = dates[i]

        next_day = dates[i + 1]

        difference = current_day - next_day

        if difference == timedelta(days=1):

            streak += 1

        else:
            break

    return streak

def get_highest_streak():

    entries = load_entries()

    if not entries:
        return 0

    dates = []

    for entry in entries:

        date_object = datetime.strptime(
            entry["date"],
            "%d/%m/%Y"
        ).date()

        dates.append(date_object)

    dates.sort()

    highest_streak = 1

    current_streak = 1

    for i in range(len(dates) - 1):

        current_day = dates[i]

        next_day = dates[i + 1]

        difference = next_day - current_day

        if difference == timedelta(days=1):

            current_streak += 1

            if current_streak > highest_streak:

                highest_streak = current_streak

        else:

            current_streak = 1

    return highest_streak