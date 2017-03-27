package log

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
	"path"
	"runtime"
	"strconv"
	"strings"
	"sync"
)

const (
	// DebugLevel logging is for development level logging.
	DebugLevel = 1
	// InfoLevel logging is for high granularity development logging events.
	InfoLevel = 2
	// WarnLevel logging is for unexpected and recoverable events.
	WarnLevel = 3
	// ErrorLevel logging is for unexpected and unrecoverable fatal events.
	ErrorLevel = 4
)

var (
	showRoutineID = false
	loggingLevel  = DebugLevel
	output        = os.Stdout
	mu            = &sync.Mutex{}
)

func getGoroutineID() (uint64, error) {
	b := make([]byte, 64)
	b = b[:runtime.Stack(b, false)]
	b = bytes.TrimPrefix(b, []byte("goroutine "))
	b = b[:bytes.IndexByte(b, ' ')]
	return strconv.ParseUint(string(b), 10, 64)
}

func retrieveCallInfo() string {
	pc, file, line, _ := runtime.Caller(3)
	// get full path to file
	fullpath := runtime.FuncForPC(pc).Name()
	// strip out vendor path if it exists
	parts := strings.Split(fullpath, "/vendor/")
	pckg := parts[len(parts)-1]
	// get package name
	parts = strings.Split(pckg, "/")
	lastIndex := len(parts) - 1
	index := 3 // domain/company/root
	if index > lastIndex {
		index = lastIndex
	}
	// remove function
	parts[lastIndex] = strings.Split(parts[lastIndex], ".")[0]
	packageName := strings.Join(parts[index:], "/")
	// get file name
	_, fileName := path.Split(file)
	// determine whether or not to show goroutine id
	if showRoutineID {
		gid, err := getGoroutineID()
		if err == nil {
			return fmt.Sprint(packageName, "/", fileName, ":", line, ", gid:", gid)
		}
	}
	return fmt.Sprint(packageName, "/", fileName, ":", line)
}

func sprint(args ...interface{}) string {
	// ensure that spaces are put between ALL operands
	msg := fmt.Sprintln(args...)
	return msg[:len(msg)-1]
}

func writeOutputf(level int, format string, args ...interface{}) {
	if level < loggingLevel {
		return
	}
	mu.Lock()
	writer := bufio.NewWriter(output)
	msg := fmt.Sprintf(format, args...)
	defer mu.Unlock()    // then unlock
	defer writer.Flush() // flush first
	writer.Write(formatLog(level, msg, retrieveCallInfo()))
}

func writeOutput(level int, args ...interface{}) {
	if level < loggingLevel {
		return
	}
	mu.Lock()
	writer := bufio.NewWriter(output)
	defer mu.Unlock()    // then unlock
	defer writer.Flush() // flush first
	writer.Write(formatLog(level, sprint(args...), retrieveCallInfo()))
}

// Debugf logging is for debug level logging events.
func Debugf(format string, args ...interface{}) {
	writeOutputf(DebugLevel, format, args...)
}

// Infof logging is for high granularity logging events.
func Infof(format string, args ...interface{}) {
	writeOutputf(InfoLevel, format, args...)
}

// Warnf logging is for unexpected and recoverable events.
func Warnf(format string, args ...interface{}) {
	writeOutputf(WarnLevel, format, args...)
}

// Errorf level is for unexpected and unrecoverable fatal events.
func Errorf(format string, args ...interface{}) {
	writeOutputf(ErrorLevel, format, args...)
}

// Debug logging is for debug level logging events.
func Debug(args ...interface{}) {
	writeOutput(DebugLevel, args...)
}

// Info logging is for high granularity logging events.
func Info(args ...interface{}) {
	writeOutput(InfoLevel, args...)
}

// Warn logging is for unexpected and recoverable events.
func Warn(args ...interface{}) {
	writeOutput(WarnLevel, args...)
}

// Error level is for unexpected and unrecoverable fatal events.
func Error(args ...interface{}) {
	writeOutput(ErrorLevel, args...)
}

// SetLevel sets the current logging output level.
func SetLevel(level int) {
	loggingLevel = level
	switch level {
	case DebugLevel:
		loggingLevel = level
	case InfoLevel:
		loggingLevel = level
	case WarnLevel:
		loggingLevel = level
	case ErrorLevel:
		loggingLevel = level
	}
}

// ShowGoRoutineID enables appending the goroutine ID to the log output.
func ShowGoRoutineID() {
	showRoutineID = true
}

// HideGoRoutineID disables appending the goroutine ID to the log output.
func HideGoRoutineID() {
	showRoutineID = false
}
