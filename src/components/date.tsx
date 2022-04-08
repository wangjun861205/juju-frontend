import { DatePicker, Button, Row, Calendar } from "antd";
import moment, { Moment } from "moment";
import { useState, useEffect } from "react";
import { get, put } from "../utils/api";

type Range = {
	start: Moment | null,
	end: Moment | null,
}
export const List = (props: { ranges: Range[] }) => {
	return <div>
		{props.ranges.map(r => {
			return <DatePicker.RangePicker value={[r.start, r.end]} />
		})}

	</div>
}
export const Update = (props: { ranges: Range[], setRanges: (ranges: Range[]) => void }) => {
	return <div>
		<Button onClick={() => {
			const newRanges = props.ranges.concat({ start: null, end: null });
			props.setRanges(newRanges);

		}}>Add Range</Button>
		{props.ranges.map((r, i) => {
			return <Row><DatePicker.RangePicker format={"YYYY-MM-DD"} value={[r.start, r.end]} onChange={(v) => {
				const newRanges = [...props.ranges];
				if (v) {
					newRanges[i].start = v[0];
					newRanges[i].end = v[1];
				}
				props.setRanges(newRanges);
			}} /><Button onClick={() => {
				const newRanges = [...props.ranges];
				newRanges.splice(i, 1);
				props.setRanges(newRanges);
			}}>Remove</Button></Row>
		})}

	</div>
}

export const U = ({ vote_id }: { vote_id: string }) => {
	const [ranges, setRanges] = useState<Range[]>([]);
	const submit = () => {
		put<{ start: string, end: string }[]>(`/votes/${vote_id}/date_ranges`, {
			body: ranges.map(r => {
				return {
					start: r.start?.format("YYYY-MM-DD") || null,
					end: r.end?.format("YYYY-MM-DD") || null,
				}
			})
		}).then(ranges => setRanges(ranges.map(r => {
			return {
				start: moment(r.start, "YYYY-MM-DD"),
				end: moment(r.end, "YYYY-MM-DD"),
			}
		}))).catch(e => console.log(e));
	}
	useEffect(() => {
		get<{ start: string, end: string }[]>(`/votes/${vote_id}/date_ranges`).then(ranges => {
			const rs = ranges.map(r => {
				const start = moment(r.start, "YYYY-MM-DD");
				const end = moment(r.end, "YYYY-MM-DD");
				return { start: start, end: end };
			});
			setRanges(rs);
		}).catch((e) => console.log(e));
	}, [vote_id]);

	return <div>
		<Update ranges={ranges} setRanges={setRanges} />
		<Button onClick={submit}>Submit</Button>
	</div>

}

type MonthReportItem = {
	date_: Moment,
	rate: number,
}

type YearReportItem = {
	month: number,
	u25_count: number,
	u50_count: number,
	u75_count: number,
	u100_count: number,
	p100_count: number,
}

export const Report = ({ vote_id }: { vote_id: string }) => {
	const [monthReport, setMonthReport] = useState<MonthReportItem[]>();
	const [yearReport, setYearReport] = useState<YearReportItem[]>();
	const fetchMonthReport = (year: number, month: number) => {
		get<{ date_: string, rate: number }[]>(`/votes/${vote_id}/date_ranges/report/month`, { params: { year: year, month: month } }).then(
			r => setMonthReport(r.map(v => { return { date_: moment(v.date_), rate: v.rate } }))
		).catch(reason => {
			console.log(reason)
		});
	}

	const fetchYearReport = (year: number) => {
		get<YearReportItem[]>(`/votes/${vote_id}/date_ranges/report/year`, { params: { year: year } }).then(r => setYearReport(r)).catch(reason => console.log(reason))
	}

	useEffect(() => {
		const curr = moment();
		fetchMonthReport(curr.year(), curr.month());
		fetchYearReport(curr.year());
	}, [])

	const monthCellRender = (date: Moment) => {
		const item = yearReport?.find(v => v.month - 1 === date.month());
		return <div>{item && (item?.u25_count || item?.u50_count || item?.u75_count || item?.u100_count || item?.p100_count) && <div>
			<li>below 25%: {item?.u25_count}</li>
			<li>below 50%: {item?.u50_count}</li>
			<li>below 75%: {item?.u75_count}</li>
			<li>below 100%: {item?.u100_count}</li>
			<li>100%: {item?.p100_count}</li>
		</div>}</div>
	}

	const dateCellRender = (date: Moment) => {
		const item = monthReport?.find(v => v.date_.year() === date.year() && v.date_.month() === date.month() && v.date_.date() === date.date());
		return <div>
			<li>{item && item.rate > 0 && `Rate: ${item.rate / 100}%`}</li>
		</div>
	}

	const onPanelChange = (date: Moment, mode: string) => {
		if (mode === "year") {
			fetchYearReport(date.year());
		} else {
			fetchMonthReport(date.year(), date.month() + 1)
		}
	}

	return <Calendar monthCellRender={monthCellRender} dateCellRender={dateCellRender} onPanelChange={onPanelChange} />
}