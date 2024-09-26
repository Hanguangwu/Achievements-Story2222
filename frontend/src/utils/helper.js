import NO_SEARCH_DATA_IMG from "../assets/images/no-search-data.svg";
import NO_FILTER_DATA_IMG from "../assets/images/no-filter-data.svg";
import ADD_ACHIEVEMENT_IMG from "../assets/images/add-achievement.svg";



export const getInitials = (name) => {
    if (!name) return ""

    const words = name.split(" ")

    let initials = ""

    for (let i = 0; i < Math.min(words.length, 2); i++) {
        initials += words[i][0]
    }

    return initials.toUpperCase()
}

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return regex.test(email)
}

export const getEmptyCardMessage = (filterType) => {
    switch (filterType) {
        case "search":
            return `Oops! No achievements found matching your search.`;
        case "date":
            return `No achievements found in the given date range.`;
        default:
            return `Start creating your first Achievement Story! Click the 'Add' button to jot down your achievements, ideas and memories. Let's get started!`;
    }
};

export const getEmptyCardImg = (filterType) => {
    switch (filterType) {
        case "search":
            return NO_SEARCH_DATA_IMG;
        case "date":
            return NO_FILTER_DATA_IMG;
        default:
            return ADD_ACHIEVEMENT_IMG;
    }
};
