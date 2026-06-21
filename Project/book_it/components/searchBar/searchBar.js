import s from "./searchBar.module.scss"

export default function SearchBar() {
    return (
        <div className={s.wrapper}>
            <div className={s.inputs}>
                <div className={s.field}>
                    <input type="text" placeholder="What service do you need?" />
                </div>
                <div className={s.divider} />
                <div className={s.field}>
                    <input type="text" placeholder="Location" />
                </div>
            </div>
            <button className={s.searchBtn}>Search</button>
        </div>
    )
}
