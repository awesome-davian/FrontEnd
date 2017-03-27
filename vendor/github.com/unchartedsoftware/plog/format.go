package log

import (
	"bytes"
	"fmt"
	"runtime"
	"time"

	"github.com/mattn/go-isatty"
	"github.com/mgutz/ansi"
)

var (
	isTerminal = isatty.IsTerminal(output.Fd())
	isColored  = isTerminal && (runtime.GOOS != "windows")
)

func formatLog(level int, msg string, fileinfo string) []byte {
	b := &bytes.Buffer{}
	if isColored {
		printColored(b, level, msg, fileinfo)
	} else {
		printUncolored(b, level, msg, fileinfo)
	}
	b.WriteByte('\n')
	return b.Bytes()
}

func getLevelString(level int) string {
	switch level {
	case InfoLevel:
		return " INFO "
	case WarnLevel:
		return " WARN "
	case ErrorLevel:
		return " ERROR "
	default:
		return " DEBUG "
	}
}

func getLevelColor(level int) string {
	switch level {
	case InfoLevel:
		return ansi.Reset
	case WarnLevel:
		return ansi.Yellow
	case ErrorLevel:
		return ansi.Red
	default:
		return ansi.Blue
	}
}

func printColored(b *bytes.Buffer, level int, msg string, fileinfo string) {
	levelText := getLevelString(level)
	levelColor := getLevelColor(level)
	// write log message to buffer
	fmt.Fprintf(b, "%s[ %s ]%s %s[%s]%s %s %s(%s)%s",
		ansi.LightBlack,
		time.Now().Format(time.Stamp),
		ansi.Reset,
		levelColor,
		levelText,
		ansi.Reset,
		msg,
		ansi.Cyan,
		fileinfo,
		ansi.Reset)
}

func printUncolored(b *bytes.Buffer, level int, msg string, fileinfo string) {
	levelText := getLevelString(level)
	// write log message to buffer
	fmt.Fprintf(b, "[ %s ] [%s] %s (%s)",
		time.Now().Format(time.Stamp),
		levelText,
		msg,
		fileinfo)
}
