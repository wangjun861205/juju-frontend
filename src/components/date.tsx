import { DatePicker, Button, Row } from "antd";
import { Moment } from "moment";

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
