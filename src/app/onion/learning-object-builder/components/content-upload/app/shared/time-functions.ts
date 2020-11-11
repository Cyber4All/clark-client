export class TimeFunctions {
  public static getTimestampAge(timestamp: number): string {
    return this.convertTimestamp(timestamp);
  }

  private static convertTimestamp(timestamp: number): string {
    // Ensure timestamp is a number;
    timestamp = +timestamp;
    const currTimeInSeconds = Math.floor(Date.now() / 1000);
    const submittedSeconds = Math.floor(timestamp / 1000);
    if (currTimeInSeconds - submittedSeconds <= 59) {
      return 'less than a minute ago';
    } else if (
      currTimeInSeconds - submittedSeconds >= 60 &&
      currTimeInSeconds - submittedSeconds < 3600
    ) {
      if (Math.floor((currTimeInSeconds - submittedSeconds) / 60) === 1) {
        return (
          Math.floor((currTimeInSeconds - submittedSeconds) / 60) +
          ' minute ago'
        );
      }
      return (
        Math.floor((currTimeInSeconds - submittedSeconds) / 60) + ' minutes ago'
      );
    } else if (
      Math.floor((currTimeInSeconds - submittedSeconds) / 60) >= 60 &&
      Math.floor((currTimeInSeconds - submittedSeconds) / 60) < 1440
    ) {
      if (
        Math.floor((currTimeInSeconds - submittedSeconds) / Math.pow(60, 2)) === 1
      ) {
        return (
          Math.floor((currTimeInSeconds - submittedSeconds) / Math.pow(60, 2)) +
          ' hour ago'
        );
      }
      return (
        Math.floor((currTimeInSeconds - submittedSeconds) / Math.pow(60, 2)) +
        ' hours ago'
      );
    } else if (
      Math.floor((currTimeInSeconds - submittedSeconds) / 60) >= 1440
    ) {
      return new Date(timestamp).toLocaleString('en-us', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }
}
