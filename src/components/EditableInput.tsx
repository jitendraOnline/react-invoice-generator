import React, { FC } from 'react'
import { Text } from '@react-pdf/renderer'
import compose from '../styles/compose'

interface Props {
  className?: string
  placeholder?: string
  value?: string
  type?:string
  onChange?: (value: string) => void
  pdfMode?: boolean
  dataList?:any
  filedName?:string
  disabled?:boolean
}

const EditableInput: FC<Props> = ({
  className,
  placeholder,
  value,
  onChange,
  pdfMode,
  type,
  dataList,
  filedName,
  disabled,
}) => {
  return (
    <>
      {pdfMode ? (
        <Text style={compose("span " + (className ? className : ""))}>
          {value}
        </Text>
      ) : (
        <>
          <input
            type={type ? type : "text"}
            className={"input " + (className ? className : "")}
            placeholder={placeholder || ""}
            value={value || ""}
            disabled={disabled ? true : false}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            list={filedName}
          />

          {dataList && filedName && (
            <datalist id={filedName}>
              {dataList.map((data: any) => (
                <option value={data} key={data}></option>
              ))}
            </datalist>
          )}
        </>
      )}
    </>
  );
};

export default EditableInput
