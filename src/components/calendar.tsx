import React, { useEffect, useState, useImperativeHandle, forwardRef, Ref } from "react"
import "./calendar.css"
import { Select } from "antd";
import "antd/dist/antd.css";

const { Option } = Select;

class MyDate {
	date?: Date;
	isEmpty: boolean;
	isPicked: boolean;

	constructor(isEmpty: boolean, isPicked: boolean, date?: Date) {
		this.isEmpty = isEmpty;
		this.isPicked = isPicked;
		this.date = date;
	}

	isPast = (): boolean => {
		let curr = new Date();
		curr.setHours(0, 0, 0, 0);
		return this.date! < curr;
	}

	toString = (): string => {
		return this.isEmpty ? "" : this.date!.toISOString().slice(0, 10)
	}
}




const Day = (props: { day: MyDate, onClick: (d: MyDate) => void }) => {
	return !props.day.isEmpty ? <td className={
		"day" + (props.day.isPast() ? " past" : "") +
		(props.day.date!.getDay() === 0 ? " Sunday" : "") +
		(props.day.date!.getDay() === 6 ? " Saturday" : "") +
		(props.day.isPicked ? " picked" : "")
	} onClick={(e) => {
		props.onClick(props.day)
	}}> {props.day.date?.getDate()}</td > : <td></td>;

}

const Month = (props: { year: number, month: number, onClick: (d: MyDate) => void }) => {
	const [days, setDays] = useState<MyDate[][]>([]);
	useEffect(() => {
		let date = new Date();
		date.setFullYear(props.year);
		date.setMonth(props.month);
		date.setDate(1);
		let days: Date[] = [];
		while (date.getMonth() === props.month) {
			days.push(new Date(date));
			date.setDate(date.getDate() + 1);
		}
		let l: MyDate[][] = [];
		let ll: MyDate[] = [];
		for (var i = 1; i < (days[0].getDay() === 0 ? 7 : days[0].getDay()); i++) {
			let md: MyDate = new MyDate(true, false);
			ll.push(md);
		}
		l.push(ll);
		for (const d of days) {
			let md: MyDate = new MyDate(false, false, d)
			if (d.getDay() === 1) {
				l.push([md]);
			} else {
				l.at(-1)!.push(md)
			}
		}
		while (1) {
			if (l.at(-1)!.length < 7) {
				let md: MyDate = new MyDate(true, false);
				l.at(-1)!.push(md);
			} else {
				break;
			}
		}
		setDays(l)
	}, [])

	const render = () => {
		return <div>
			<table>
				<thead>
					<tr>
						<td>星期一</td><td>星期二</td><td>星期三</td><td>星期四</td><td>星期五</td><td className="Saturday">星期六</td><td className="Sunday">星期天</td>
					</tr>
				</thead>
				<tbody>
					{
						days.map((ll, i) => {
							return <tr key={i}>
								{ll.map((d, i) => {
									return <Day key={i + d.toString()} day={d} onClick={props.onClick} />
								})}
							</tr>
						})
					}
				</tbody>
			</table>
		</div >

	}

	return render()

}

const Year = (props: { year: number, start: number, end: number, onClick: (d: MyDate) => void }) => {
	const list = [];
	for (var i = props.start; i <= props.end; i++) {
		list.push(
			<div>
				<div className="month-header">{i + 1}月</div>
				<Month year={props.year} month={i} onClick={props.onClick} />
			</div>
		)
	}
	return <div>
		{list.map((m) => { return m })}
	</div>
}


const Calendar = forwardRef((props: { picked?: Set<string> }, ref: Ref<any>) => {
	const current = new Date();
	const [status, setStatus] = useState<{ scope: string, picked: Set<string> }>({ scope: 'month', picked: props.picked ? props.picked : new Set() });
	const onClick = (d: MyDate) => {
		if (d.isPast()) {
			return;
		}
		const newSet = new Set(status.picked);
		if (d.isPicked) {
			d.isPicked = false;
			newSet.delete(d.toString());
		} else {
			d.isPicked = true;
			newSet.add(d.toString());
		}
		console.log(newSet)
		setStatus({ ...status, picked: newSet });
	}
	useImperativeHandle(ref, () => ({
		getPickedDates: () => {
			return Array.from(status.picked);
		}
	})
	);
	return <div>
		< Select className="scope-select" defaultValue="month" onChange={(e) => { setStatus({ ...status, scope: e }); }}>
			<Option value='month'>月</Option>
			<Option value='year'>年</Option>
		</Select >
		{status.scope === 'month' ? <Month year={current.getFullYear()} month={current.getMonth()} onClick={onClick} /> : <Year year={current.getFullYear()} start={current.getMonth()} end={11} onClick={onClick} />}
	</div >

});

export default Calendar